import { createTestRenderer } from "@opentui/core/testing";
import { createRoot } from "@opentui/react";
import { createElement, type ReactNode } from "react";
import { onTestFinished } from "vitest";
import { defaultViewport } from "./constants.js";
import createScreen from "./createScreen.js";
import ErrorCatcher from "./ErrorCatcher.js";
import flushReact from "./flushReact.js";
import registerSerializer from "./registerSerializer.js";
import type { Screen, Viewport } from "./types.js";

/**
 * Mounts `node` on a screen of the given size, drawn by the renderer's own
 * test renderer, and resolves once the screen has settled.
 *
 * The component is mounted inside an awaited `act`, so one that suspends on
 * its first render is retried when what it waits for arrives. What the
 * component throws, while it draws or in an effect, rejects the call that
 * was settling the screen, this one or a later one. The screen is unmounted
 * when the test that made it ends. A screenshot given to one of
 * vitest's snapshot matchers is saved as a golden's text.
 *
 * @note Impure: creates a renderer and registers its removal on the running test.
 */
export default async function render(
  node: ReactNode,
  viewport: Viewport = defaultViewport,
): Promise<Screen> {
  registerSerializer();
  const setup = await createTestRenderer({
    width: viewport.cols,
    height: viewport.rows,
    // Keys are sent as a terminal with the kitty keyboard protocol sends
    // them, so a lone Escape arrives at once, and every modifier arrives
    // with the key it is held with.
    kittyKeyboard: true,
    // Left on, Ctrl+C would close the renderer before the component under
    // test could be seen to handle it.
    exitOnCtrlC: false,
  });
  const root = createRoot(setup.renderer);
  const errors: unknown[] = [];
  const screen = createScreen(setup, root, errors);
  onTestFinished(screen.unmount);
  await flushReact(() =>
    root.render(
      createElement(
        ErrorCatcher,
        { onError: (error) => errors.push(error) },
        node,
      ),
    ),
  );
  await screen.settle();
  return screen;
}
