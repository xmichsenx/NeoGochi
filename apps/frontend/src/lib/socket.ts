import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
    const sessionId = getOrCreateSessionId();

    socket = io(url, {
      query: { sessionId },
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem('neogochi-session-id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('neogochi-session-id', sessionId);
  }
  return sessionId;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
