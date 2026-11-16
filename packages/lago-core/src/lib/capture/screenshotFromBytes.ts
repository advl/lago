import type { Viewport } from "../screen/index.js";
import type { Screenshot } from "../screenshot/index.js";
import createEmulator from "./createEmulator.js";

/**
 * The timer as this module loads, before a test fakes it, to tell whether
 * the emulator's own timer would ever fire.
 */
const { setTimeout: realTimer } = globalThis;

/**
 * What a terminal of the given size shows after reading `bytes`, as a
 * screenshot: the same shape a renderer's own screen is read into, so one
 * golden can hold either.
 *
 * The emulator reads on a timer, so this resolves on the event loop's own
 * time, and is refused while `setTimeout` is faked, when it would wait for
 * ever. A screen mounted with `renderStream` reads its bytes as it settles.
 */
export default async function screenshotFromBytes(
  bytes: string,
  viewport: Viewport,
): Promise<Screenshot> {
  if (globalThis.setTimeout !== realTimer) {
    throw new Error(
      "screenshotFromBytes reads on the emulator's own timer, and setTimeout is faked, so it would never return. Put the real timers back with vi.useRealTimers() first, or read the screen renderStream gives.",
    );
  }
  const emulator = createEmulator(viewport);
  try {
    await emulator.write(bytes);
    return emulator.read();
  } finally {
    emulator.dispose();
  }
}
