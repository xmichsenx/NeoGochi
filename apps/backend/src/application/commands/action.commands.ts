export class FeedCommand {
  constructor(public readonly sessionId: string) {}
}

export class PlayCommand {
  constructor(public readonly sessionId: string) {}
}

export class SleepCommand {
  constructor(public readonly sessionId: string) {}
}

export class WakeUpCommand {
  constructor(public readonly sessionId: string) {}
}

export class CleanCommand {
  constructor(public readonly sessionId: string) {}
}

export class HealCommand {
  constructor(public readonly sessionId: string) {}
}
