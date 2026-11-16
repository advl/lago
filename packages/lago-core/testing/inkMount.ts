import { createElement, type FunctionComponent } from "react";
import type { Mount } from "../src/lib/stream/index.js";

type Screens = typeof import("./inkScreens.js");

/**
 * A mount that draws one of the screens in `inkScreens.ts` with Ink. Ink,
 * the colour library it reads the environment through, and the screens that
 * import it are all loaded inside the mount, after the environment is set: a
 * file that imported Ink at its top would have fixed its colours before.
 */
export const mountInk =
  (choose: (screens: Screens) => FunctionComponent): Mount =>
  async ({ input, output }) => {
    const screens = await import("./inkScreens.js");
    const { render } = await import("ink");
    const app = render(createElement(choose(screens)), {
      stdout: output as NodeJS.WriteStream,
      stdin: input as NodeJS.ReadStream,
      patchConsole: false,
      exitOnCtrlC: false,
    });
    return () => app.unmount();
  };
