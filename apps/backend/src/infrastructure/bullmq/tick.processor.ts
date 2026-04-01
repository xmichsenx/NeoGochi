import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { TickSchedulerPort } from '../../application/ports/tick-scheduler.port';
import { TickCommand } from '../../application/commands/tick.command';

@Injectable()
export class BullMQTickProcessor implements TickSchedulerPort {
  private readonly queue: Queue;
  private readonly worker: Worker;
  private readonly connection: Redis;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
  ) {
    this.connection = new Redis({
      host: this.configService.get<string>('game.redis.host', 'localhost'),
      port: this.configService.get<number>('game.redis.port', 6379),
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue('pet-tick', { connection: this.connection });

    this.worker = new Worker(
      'pet-tick',
      async (job) => {
        const { sessionId } = job.data;
        await this.commandBus.execute(new TickCommand(sessionId));
      },
      { connection: this.connection },
    );
  }

  async scheduleTickJob(sessionId: string): Promise<void> {
    const intervalMs = this.configService.get<number>('game.tick.intervalMs', 30000);

    await this.queue.add(
      `tick-${sessionId}`,
      { sessionId },
      {
        repeat: {
          every: intervalMs,
        },
        jobId: `tick-${sessionId}`,
      },
    );
  }

  async removeTickJob(sessionId: string): Promise<void> {
    const repeatableJobs = await this.queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === `tick-${sessionId}`) {
        await this.queue.removeRepeatableByKey(job.key);
      }
    }
  }

  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
    await this.connection.quit();
  }
}
