import { getByText, readLines } from "@aztlan/lago-core";
import type { TestRendererSetup } from "@opentui/core/testing";
import type { Root } from "@opentui/react";
import captureScreenshot from "./captureScreenshot.js";
import flushReact from "./flushReact.js";
import parseKeyboard from "./parseKeyboard.js";
import settleScreen from "./settleScreen.js";
import type { Screen } from "./types.js";
import waitFor from "./waitFor.js";

/**
 * The screen a test holds: what the renderer shows, read back, and the
 * keyboard in front of it. `errors` collects what the component threw.
 *
 * @note Impure: reads and drives the renderer it is given.
 */
export default function createScreen(
  setup: TestRendererSetup,
  root: Root,
  errors: readonly unknown[],
): Screen {
  let mounted = true;
  const screenshot = () => {
    // A test that ran out of time can still be reading its screen after the
    // screen is closed, and reading a closed renderer's buffer ends the
    // whole test process.
    if (!mounted) {
      throw new Error(
        "The screen was unmounted, as every screen is when its test ends.",
      );
    }
    return captureScreenshot(setup.captureSpans());
  };
  // Once the component has thrown, every settle fails with what it threw:
  // nothing of it is left on the screen to read.
  const settle = async () => {
    await settleScreen(setup);
    if (errors.length > 0) throw errors.at(0);
  };
  return {
    get lines() {
      return readLines(screenshot());
    },
    getByText: (text) => getByText(screenshot(), text),
    findByText: (text) =>
      waitFor(async () => {
        await settle();
        return getByText(screenshot(), text);
      }),
    settle,
    screenshot,
    unmount: async () => {
      if (!mounted) return;
      mounted = false;
      await flushReact(() => root.unmount());
      setup.renderer.destroy();
    },
    userEvent: {
      keyboard: async (text) => {
        // Settled after each key, as a person's keys arrive one frame apart:
        // the next key meets what the one before it drew.
        for (const { key, modifiers } of parseKeyboard(text)) {
          await flushReact(() => setup.mockInput.pressKey(key, modifiers));
          await settle();
        }
      },
      paste: async (text) => {
        await flushReact(() => setup.mockInput.pasteBracketedText(text));
        await settle();
      },
    },
  };
}
