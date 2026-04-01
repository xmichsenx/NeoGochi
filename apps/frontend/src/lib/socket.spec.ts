import { describe, it, expect, vi, beforeEach } from 'vitest';

// Must mock before importing
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: false,
  })),
}));

describe('socket lib - session persistence', () => {
  beforeEach(() => {
    // Reset module cache to get fresh socket singleton
    vi.resetModules();
    // Clear localStorage
    localStorage.clear();
  });

  it('should create a sessionId and store in localStorage', async () => {
    const { getOrCreateSessionId } = await import('./socket');

    expect(localStorage.getItem('neogochi-session-id')).toBeNull();

    const sessionId = getOrCreateSessionId();

    expect(sessionId).toBeTruthy();
    expect(typeof sessionId).toBe('string');
    expect(localStorage.getItem('neogochi-session-id')).toBe(sessionId);
  });

  it('should reuse existing sessionId from localStorage', async () => {
    const { getOrCreateSessionId } = await import('./socket');

    const first = getOrCreateSessionId();
    const second = getOrCreateSessionId();

    expect(first).toBe(second);
  });

  it('should pass sessionId as query param when connecting', async () => {
    const { io } = await import('socket.io-client');
    const { getSocket } = await import('./socket');

    getSocket();

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        query: expect.objectContaining({
          sessionId: expect.any(String),
        }),
      }),
    );
  });

  it('should return the same socket instance on multiple calls', async () => {
    const { getSocket } = await import('./socket');

    const socket1 = getSocket();
    const socket2 = getSocket();

    expect(socket1).toBe(socket2);
  });
});
