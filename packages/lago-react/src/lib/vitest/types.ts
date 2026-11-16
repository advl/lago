import type { Screenshot } from "@aztlan/lago-core";
import type { Viewport } from "../render/index.js";

/** What the plugin is given. */
export interface Options {
  /**
   * The sizes every story is drawn at, each under a name that becomes part of
   * its golden's file name, as in `{ narrow: { cols: 40, rows: 36 } }`. A
   * story changes or adds to them with `parameters.viewports`. Without them,
   * a terminal's usual 80 columns and 24 lines, named `80x24`.
   */
  readonly viewports?: Readonly<Record<string, Viewport>>;
}

/** What the plugin tells a stories file's tests, written into the file's last line. */
export interface Registration {
  readonly viewports: Readonly<Record<string, Viewport>>;
  /** The comment above each story's export, by the export's name, in the file's order. */
  readonly comments: Readonly<Record<string, string>>;
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
  /** Where the story's golden is kept. */
  readonly golden: string;
  /** What the screen showed, and the same as the text a golden holds. */
  readonly actual: Screenshot;
  readonly text: string;
  /** What the golden holds, when there is one and it can be read. */
  readonly expected: Screenshot | undefined;
}

declare module "vitest" {
  interface TaskMeta {
    /** Set by a story's test once the story has been drawn. */
    lago?: StoryResult;
  }
}
