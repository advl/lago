import {
  createScreen,
  defaultViewport,
  registerSerializer,
  type Screen,
  type Viewport,
} from "@aztlan/lago-core";
import { createTestRenderer } from "@opentui/core/testing";
import { createRoot } from "@opentui/react";
import { createElement, type ReactNode } from "react";
import { onTestFinished } from "vitest";
import captureScreenshot from "./captureScreenshot.js";
import { rendererKeys } from "./constants.js";
import ErrorCatcher from "./ErrorCatcher.js";
import flushReact from "./flushReact.js";
import settleScreen from "./settleScreen.js";
import ViewportContext from "./ViewportContext.js";

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
  const screen = createScreen({
    capture: () => captureScreenshot(setup.captureSpans()),
    // Once the component has thrown, every settle fails with what it threw:
    // nothing of it is left on the screen to read.
    settle: async () => {
      await settleScreen(setup);
      if (errors.length > 0) throw errors.at(0);
    },
    press: ({ named, key, modifiers }) =>
      flushReact(() =>
        setup.mockInput.pressKey(named ? rendererKeys[key] : key, modifiers),
      ),
    paste: (text) => flushReact(() => setup.mockInput.pasteBracketedText(text)),
    close: async () => {
      await flushReact(() => root.unmount());
      setup.renderer.destroy();
    },
  });
  onTestFinished(screen.unmount);
  await flushReact(() =>
    root.render(
      createElement(
        ViewportContext.Provider,
        { value: viewport },
        createElement(
          ErrorCatcher,
          { onError: (error) => errors.push(error) },
          node,
        ),
      ),
    ),
  );
  await screen.settle();
  return screen;
}
