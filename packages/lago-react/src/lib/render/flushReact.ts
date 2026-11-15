import { act } from "react";
import { stoppedTimers } from "./constants.js";

/**
 * The scheduler's own turn, taken as this module loads, before a test fakes
 * anything.
 */
const { setImmediate: takeTurn } = globalThis;

/**
 * Runs `work` as React expects under test, and returns once React has
 * committed everything it caused: state updates, effects, and the promises a
 * component was waiting on.
 *
 * React's `act` waits on `setImmediate` to know that nothing more is coming.
 * With that timer faked it would wait for ever, so this refuses first and
 * says what to fake instead.
 *
 * @note Impure: runs React's pending work.
 */
export default async function flushReact(
  work: () => unknown = () => {},
): Promise<void> {
  if (globalThis.setImmediate !== takeTurn) {
    throw new Error(
      `The screen cannot settle while setImmediate is faked, because React waits on it. Fake the timers a component uses and leave that one real: vi.useFakeTimers({ toFake: ${JSON.stringify(stoppedTimers)} }).`,
    );
  }
  // React expects `act` only where this is set, and warns about any update
  // outside `act` while it is, as when a timer a test advanced sets state.
  // So it is set for the length of `act` alone.
  Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);
  try {
    await act(async () => {
      await work();
      await new Promise((resolve) => takeTurn(resolve));
    });
  } finally {
    Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", false);
  }
}
