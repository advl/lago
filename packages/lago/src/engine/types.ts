import type { Cell, StoryResult } from "@aztlan/lago-react/vitest";
import type { Tokens } from "@aztlan/tui";
import type { Catalog, StoryRecord } from "../catalog/index.js";
import type { Contributions } from "../plugins/index.js";

/** A frame of a stack, as vitest parses one. */
export interface StackFrame {
  readonly file: string;
  readonly line: number;
  readonly column: number;
}

/** An error of a test, as vitest reports one. */
export interface ReportedError {
  readonly message: string;
  readonly stacks?: readonly StackFrame[];
}

/** What the engine reads of one test of a stories file. */
export interface ReportedTest {
  /**
   * The test's own name: `<Story> at <viewport>`, `<Story> at
   * <viewport>@<mode>` in a mode, or the orphan check's.
   */
  readonly name: string;
  /** The name of the suite around it: the file's title. */
  readonly suite: string;
  readonly file: string;
  readonly state: "passed" | "failed" | "skipped" | "pending";
  readonly errors: readonly ReportedError[];
  readonly story: StoryResult | undefined;
  /** The cells the stories file leaves out, which its check of its goldens reports. */
  readonly excluded: readonly Cell[];
}

/** The test run the gallery browses, kept running. */
export interface Engine {
  /**
   * Takes a story's current picture at one viewport, in the base or in a
   * mode, as its golden, by writing the golden's file, and runs that stories
   * file again.
   */
  readonly accept: (record: StoryRecord) => Promise<void>;
  /** Stops the run. */
  readonly close: () => Promise<void>;
}

/** What starting the engine needs. */
export interface EngineOptions {
  /** The project's root, where its vitest configuration is found. */
  readonly root: string;
  /** Called once, before the first run, with what the gallery is drawn with. */
  readonly onSettings: (settings: Settings) => void;
  /** Called with the whole catalog after every run, the first included. */
  readonly onCatalog: (catalog: Catalog) => void;
}

/** What the project's configuration sets of the gallery. */
export interface Settings {
  /** The chrome the configuration names, the terminal's own when it names none. */
  readonly chrome: Tokens;
  /** What the project's plugins add to the gallery. */
  readonly plugins: Contributions;
}
