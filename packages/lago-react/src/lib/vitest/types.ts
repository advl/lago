import type { Screenshot, Viewport } from "@aztlan/lago-core";
import type { Globals } from "../story/index.js";

/**
 * What a vitest configuration needs to know of the renderer a project's
 * components and stories are drawn with.
 */
export interface Renderer {
  /** Where JSX takes its runtime from: the renderer's React reconciler. */
  readonly jsxImportSource: string;
  /**
   * The packages a project and Lago's packages must share one copy of. A
   * second copy of React has no component to call hooks from, and an object
   * made by one copy of a renderer is not one the other recognises.
   */
  readonly sharedPackages: readonly string[];
  /**
   * The export conditions a module is resolved with, so that vitest and the
   * runtime load the same build of the renderer.
   */
  readonly conditions: readonly string[];
}

/**
 * A named set of globals every story is drawn in, beside its picture in no
 * mode, the base.
 */
export interface Mode {
  /** Values of globals the preview declares; a story's own fixed ones win. */
  readonly globals: Globals;
  /**
   * The stories the mode is meant to change, by tag. One of them whose
   * picture comes out equal to the base fails: the mode did not reach it.
   */
  readonly expect?: { readonly tags: readonly string[] };
}

/** What the plugin is given. */
export interface Options {
  /**
   * The sizes every story is drawn at, each under a name that becomes part of
   * its golden's file name, as in `{ narrow: { cols: 40, rows: 36 } }`. A
   * story changes or adds to them with `parameters.viewports`. Without them,
   * a terminal's usual 80 columns and 24 lines, named `80x24`.
   */
  readonly viewports?: Readonly<Record<string, Viewport>>;
  /**
   * The project's preview: a module, named from the project's root, whose
   * default export every story is set inside, as in `"./src/lago.preview.tsx"`.
   */
  readonly preview?: string;
  /**
   * Modes every story is drawn in as well as the base, each under a name
   * that becomes part of its golden's file name, as in
   * `{ dracula: { globals: { scheme: "dracula" } } }`. A story leaves one out
   * with `parameters.modes: { dracula: { disable: true } }`.
   */
  readonly modes?: Readonly<Record<string, Mode>>;
}

/** What the plugin tells a stories file's tests, written into the file's last line. */
export interface Registration {
  readonly viewports: Readonly<Record<string, Viewport>>;
  /** The comment above each story's export, by the export's name, in the file's order. */
  readonly comments: Readonly<Record<string, string>>;
  /** Where the project's preview is, when there is one. */
  readonly preview?: string;
  /** The modes, when there are any. */
  readonly modes?: Readonly<Record<string, Mode>>;
}

/** How a mode's picture compares with the base picture at the same viewport. */
export interface Comparison {
  /** Whether the two are the same picture, in which case no golden is kept. */
  readonly equal: boolean;
  /** Whether the mode names the story, by one of its tags, among those it changes. */
  readonly expectedToDiffer: boolean;
}

/** What a story's test leaves on its task for whatever reads the run, such as a reporter. */
export interface StoryResult {
  readonly file: string;
  readonly title: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly tags: readonly string[];
  /** The name of the viewport the story was drawn at, as in its golden's name. */
  readonly viewportName: string;
  /** The mode the story was drawn in, or none for the base. */
  readonly mode?: string;
  /** The value of every global the story was drawn with. */
  readonly globals: Globals;
  /** In a mode, how the picture compares with the base's at the same viewport. */
  readonly comparison?: Comparison;
  /** Where the story's golden is kept, or would be in a mode where it is equal. */
  readonly golden: string;
  /** What the screen showed, and the same as the text a golden holds. */
  readonly actual: Screenshot;
  readonly text: string;
  /**
   * What the golden holds, when there is one and it can be read; nothing for
   * a mode's picture equal to the base's, which is compared with no golden.
   */
  readonly expected: Screenshot | undefined;
}

declare module "vitest" {
  interface TaskMeta {
    /** Set by a story's test once the story has been drawn. */
    lago?: StoryResult;
  }
}
