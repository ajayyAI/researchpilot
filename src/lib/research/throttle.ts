export class Throttle {
  private nextSlotMs = 0;
  private scheduling: Promise<void> = Promise.resolve();
  private intervalMs: number;

  constructor(intervalMs: number) {
    this.intervalMs = intervalMs;
  }

  run<T>(fn: () => Promise<T>): Promise<T> {
    const ready = this.scheduling.then(
      () => this.waitForSlot(),
      () => this.waitForSlot(),
    );
    this.scheduling = ready;
    return ready.then(fn);
  }

  private async waitForSlot(): Promise<void> {
    const now = Date.now();
    const delay = this.nextSlotMs - now;
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    this.nextSlotMs = Date.now() + this.intervalMs;
  }
}
