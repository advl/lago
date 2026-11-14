import type { TestRendererSetup } from "@opentui/core/testing";
import { frameLimit } from "./constants.js";
import flushReact from "./flushReact.js";

/**
 * Draws until the screen shows everything that has happened: React has
 * nothing left to commit and the renderer has no frame asked for.
 *
 * Each frame is drawn on demand and nothing waits on a timer, so a clock that
 * a test has stopped stays stopped. The renderer's own way of flushing waits
 * on a timer, and would never return under one.
 *
 * @note Impure: draws frames on the renderer and runs React's pending work.
 */
export default async function settleScreen(
  setup: TestRendererSetup,
): Promise<void> {
  for (let frame = 0; frame < frameLimit; frame += 1) {
    await flushReact();
    // Drawing can change state too, as when a component measures itself.
    await flushReact(() => setup.renderOnce());
    const { isRendering, hasScheduledRender } =
      setup.renderer.getSchedulerState();
    if (!isRendering && !hasScheduledRender) return;
  }
  throw new Error(
    `The screen did not settle in ${frameLimit} frames: something asks for a new frame on every frame.`,
  );
}
