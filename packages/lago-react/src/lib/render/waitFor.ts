import { onTestFailed, onTestFinished } from "vitest";
import { tryPause } from "./constants.js";

/**
 * The timer as this module loads, before a test fakes it, so a test under
 * faked timers still pauses between tries.
 */
const { setTimeout: startTimer } = globalThis;

/**
 * Runs `check` until it stops throwing, and gives what it returned.
 *
 * It keeps no time limit of its own: a busy machine only makes it wait
 * longer. An outcome that never comes fails the test at the test's own limit,
 * with the last try's failure reported beside the timeout, and the tries stop
 * with the test. It never moves faked timers between tries: a test that fakes
 * them moves them itself.
 *
 * @note Impure: registers hooks on the running test and waits on a timer.
 */
export default async function waitFor<T>(
  check: () => T | Promise<T>,
): Promise<T> {
  let last: unknown;
  let passed = false;
  let ended = false;
  onTestFailed(({ task }) => {
    if (!passed && last instanceof Error) {
      const { name, message, stack } = last;
      task.result?.errors?.push({ name, message, stack });
    }
  });
  onTestFinished(() => {
    ended = true;
  });
  while (!ended) {
    try {
      const outcome = await check();
      passed = true;
      return outcome;
    } catch (failure) {
      last = failure;
      await new Promise((resolve) => startTimer(resolve, tryPause));
    }
  }
  throw last;
}
