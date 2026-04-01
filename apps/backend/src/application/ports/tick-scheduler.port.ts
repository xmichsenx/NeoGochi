export const TICK_SCHEDULER_PORT = Symbol('TICK_SCHEDULER_PORT');

export interface TickSchedulerPort {
  scheduleTickJob(sessionId: string): Promise<void>;
  removeTickJob(sessionId: string): Promise<void>;
}
