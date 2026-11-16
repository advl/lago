import { vi } from "vitest";
import { stepLimit } from "./constants.js";

/**
 * Runs what is still waiting on the faked clock, up to the step limit, rather
 * than clearing it, so a program's last timers run as they would. Once a
 * test has put the real clock back, its faked timers are gone and there is
 * nothing left to run.
 *
 * @note Impure: moves the faked clock.
 */
export default async function runTimersOut(): Promise<void> {
  for (
    let step = 0;
    vi.isFakeTimers() && vi.getTimerCount() > 0 && step < stepLimit;
    step += 1
  ) {
    await vi.advanceTimersToNextTimerAsync();
  }
}
