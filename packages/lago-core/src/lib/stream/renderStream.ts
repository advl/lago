import { onTestFinished, vi } from "vitest";
import { createEmulator } from "../capture/index.js";
import { pinEnvironment } from "../environment/index.js";
import { encodePress, pasteMarks } from "../keys/index.js";
import {
  createScreen,
  defaultViewport,
  registerSerializer,
  type Screen,
  stoppedTimers,
  type Viewport,
} from "../screen/index.js";
import { takeTurn } from "./constants.js";
import createTerminalStreams from "./createTerminalStreams.js";
import runTimersOut from "./runTimersOut.js";
import settleStream from "./settleStream.js";
import type { Mount } from "./types.js";

/**
 * Mounts a program that draws by writing a terminal's bytes, on a terminal of
 * the given size, and resolves once its screen has settled: the same
 * `Screen` a renderer's own screen gives, read from what the program wrote.
 *
 * Time is stopped at zero for the test, unless the test has already faked
 * the timers, and the colour environment is set before the mount runs. Keys
 * are written to the program's input as a terminal sends them, and settling
 * runs the program's timers to the end, so a screen shows what the program
 * draws once nothing is left to wait for. A test that fakes `setImmediate`
 * is refused, since React commits on it. The screen is unmounted when the
 * test that made it ends, and what still waits on the faked clock then is run
 * out rather than dropped. A screenshot given to one of vitest's snapshot
 * matchers is saved as a golden's text.
 *
 * @note Impure: fakes the timers and sets the environment until the test ends, and runs the mount.
 */
export default async function renderStream(
  mount: Mount,
  viewport: Viewport = defaultViewport,
): Promise<Screen> {
  // React commits on setImmediate, and a program loaded while it is faked
  // keeps the fake for the rest of the file, so a later screen would never
  // show its effects.
  if (globalThis.setImmediate !== takeTurn) {
    throw new Error(
      `The screen cannot settle while setImmediate is faked: React and the programs it draws commit on it. Fake the timers a program uses and leave that one real: vi.useFakeTimers({ toFake: ${JSON.stringify(stoppedTimers)} }).`,
    );
  }
  registerSerializer();
  if (!vi.isFakeTimers()) {
    vi.useFakeTimers({ now: 0, toFake: [...stoppedTimers] });
    onTestFinished(() => {
      vi.useRealTimers();
    });
  }
  pinEnvironment();
  const emulator = createEmulator(viewport);
  let writes = 0;
  const { input, output } = createTerminalStreams(viewport, (bytes) => {
    writes += 1;
    void emulator.write(bytes);
  });
  const unmountProgram = await mount({ input, output, viewport });
  const screen = createScreen({
    capture: emulator.read,
    settle: () => settleStream(() => writes, emulator),
    press: async (press) => {
      input.write(encodePress(press));
    },
    paste: async (text) => {
      input.write(`${pasteMarks.start}${text}${pasteMarks.end}`);
    },
    close: async () => {
      await unmountProgram();
      await runTimersOut();
      emulator.dispose();
    },
  });
  onTestFinished(screen.unmount);
  await screen.settle();
  return screen;
}
