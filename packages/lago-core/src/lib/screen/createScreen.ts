import { getByText, readLines } from "../screenshot/index.js";
import parseKeyboard from "./parseKeyboard.js";
import type { Screen, ScreenParts } from "./types.js";
import waitFor from "./waitFor.js";

/**
 * The screen a test holds, from the parts a renderer gives: what it shows,
 * read back, and the keyboard in front of it. Whatever draws the screen, a
 * test reads and drives it the same way.
 *
 * @note Impure: calls the renderer's parts it is given.
 */
export default function createScreen(parts: ScreenParts): Screen {
  let mounted = true;
  const screenshot = () => {
    // A test that ran out of time can still be reading its screen after the
    // screen is closed, and reading a closed renderer can end the whole test
    // process.
    if (!mounted) {
      throw new Error(
        "The screen was unmounted, as every screen is when its test ends.",
      );
    }
    return parts.capture();
  };
  return {
    get lines() {
      return readLines(screenshot());
    },
    getByText: (text) => getByText(screenshot(), text),
    findByText: (text) =>
      waitFor(async () => {
        await parts.settle();
        return getByText(screenshot(), text);
      }),
    settle: parts.settle,
    screenshot,
    unmount: async () => {
      if (!mounted) return;
      mounted = false;
      await parts.close();
    },
    userEvent: {
      keyboard: async (text) => {
        // Settled after each key, as a person's keys arrive one frame apart:
        // the next key meets what the one before it drew.
        for (const press of parseKeyboard(text)) {
          await parts.press(press);
          await parts.settle();
        }
      },
      paste: async (text) => {
        await parts.paste(text);
        await parts.settle();
      },
    },
  };
}
