import { vi } from "vitest";
import type { Emulator } from "../capture/index.js";
import { realTurns, stepLimit, takeTurn } from "./constants.js";

/** Lets what waits on no faked timer run: promises, React's commits, a program's own turns. */
async function takeRealTurns(): Promise<void> {
  for (let turn = 0; turn < realTurns; turn += 1) {
    await new Promise((resolve) => takeTurn(resolve));
  }
}

/**
 * Runs the program's time forward until its screen shows everything that
 * will happen: no faked timer is waiting, a whole step wrote nothing, and the
 * emulator has read every byte. A program waiting on a timer is run to it,
 * however far off, since what the stream shows is what the program writes
 * once nothing is left to wait for. Each step first lets the real turns run,
 * so a commit no faked timer schedules has landed before quiet is judged.
 *
 * @note Impure: moves the faked clock and lets pending work run.
 */
export default async function settleStream(
  countWrites: () => number,
  emulator: Emulator,
): Promise<void> {
  for (let step = 0; step < stepLimit; step += 1) {
    const before = countWrites();
    await takeRealTurns();
    if (
      vi.getTimerCount() === 0 &&
      countWrites() === before &&
      !emulator.isReading()
    )
      return;
    await vi.advanceTimersToNextTimerAsync();
  }
  throw new Error(
    `The screen did not settle in ${stepLimit} steps: a timer still waits, or the program writes on every step, as an interval or an animation does.`,
  );
}
