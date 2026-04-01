import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BullMQTickProcessor } from './tick.processor';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { TickCommand } from '../../application/commands/tick.command';

// Mock ioredis
vi.mock('ioredis', () => {
  const MockRedis = vi.fn(() => ({
    quit: vi.fn().mockResolvedValue(undefined),
  }));
  return { default: MockRedis };
});

// Mock bullmq
const mockQueueAdd = vi.fn().mockResolvedValue(undefined);
const mockGetRepeatableJobs = vi.fn().mockResolvedValue([]);
const mockRemoveRepeatableByKey = vi.fn().mockResolvedValue(undefined);
const mockQueueClose = vi.fn().mockResolvedValue(undefined);
const mockWorkerClose = vi.fn().mockResolvedValue(undefined);
let capturedWorkerProcessor: ((job: { data: { sessionId: string } }) => Promise<void>) | null =
  null;

vi.mock('bullmq', () => ({
  Queue: vi.fn(() => ({
    add: mockQueueAdd,
    getRepeatableJobs: mockGetRepeatableJobs,
    removeRepeatableByKey: mockRemoveRepeatableByKey,
    close: mockQueueClose,
  })),
  Worker: vi.fn(
    (name: string, processor: (job: { data: { sessionId: string } }) => Promise<void>) => {
      capturedWorkerProcessor = processor;
      return { close: mockWorkerClose };
    },
  ),
}));

describe('BullMQTickProcessor', () => {
  let processor: BullMQTickProcessor;
  let commandBus: CommandBus;
  let configService: ConfigService;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedWorkerProcessor = null;

    commandBus = {
      execute: vi.fn().mockResolvedValue(undefined),
    } as unknown as CommandBus;

    configService = {
      get: vi.fn((key: string, defaultValue: unknown) => defaultValue),
    } as unknown as ConfigService;

    processor = new BullMQTickProcessor(commandBus, configService);
  });

  it('should schedule a tick job with correct interval', async () => {
    await processor.scheduleTickJob('session-1');

    expect(mockQueueAdd).toHaveBeenCalledWith(
      'tick-session-1',
      { sessionId: 'session-1' },
      {
        repeat: { every: 30000 },
        jobId: 'tick-session-1',
      },
    );
  });

  it('should remove repeatable job by session id', async () => {
    mockGetRepeatableJobs.mockResolvedValue([
      { id: 'tick-session-1', key: 'key-1' },
      { id: 'tick-session-2', key: 'key-2' },
    ]);

    await processor.removeTickJob('session-1');

    expect(mockRemoveRepeatableByKey).toHaveBeenCalledWith('key-1');
    expect(mockRemoveRepeatableByKey).not.toHaveBeenCalledWith('key-2');
  });

  it('should dispatch TickCommand when worker processes a job', async () => {
    expect(capturedWorkerProcessor).not.toBeNull();

    await capturedWorkerProcessor!({ data: { sessionId: 'session-1' } });

    expect(commandBus.execute).toHaveBeenCalledOnce();
    const command = (commandBus.execute as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(command).toBeInstanceOf(TickCommand);
    expect(command.sessionId).toBe('session-1');
  });

  it('should close worker, queue, and connection on destroy', async () => {
    await processor.onModuleDestroy();

    expect(mockWorkerClose).toHaveBeenCalled();
    expect(mockQueueClose).toHaveBeenCalled();
  });
});
