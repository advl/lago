import type { Screenshot } from "@aztlan/lago-react";

/**
 * Where a story's picture stands against its golden: the same (`pass`),
 * different (`changed`), with no golden yet (`new`), or not drawn at all
 * because the story threw (`error`).
 */
export type Status = "pass" | "changed" | "new" | "error";

/**
 * How a mode's picture stands against the base picture at the same
 * viewport: the same, so it keeps no golden of its own (`equal`); different,
 * so it is compared with its own golden (`distinct`); or the same where the
 * mode expected a change, which fails (`unreached`).
 */
export type Comparison = "equal" | "distinct" | "unreached";

/** One story drawn at one viewport, in the base or in a mode, as the test run left it. */
export interface StoryRecord {
  /** The stories file. */
  readonly file: string;
  /** The file's title, as `group/Component`. */
  readonly title: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly viewportName: string;
  /** The mode the story was drawn in; none for the base. */
  readonly mode: string | undefined;
  /** In a mode, how the picture compares with the base's, once it is drawn. */
  readonly comparison: Comparison | undefined;
  /** The value of every global the story was drawn with, once it is drawn. */
  readonly globals: Readonly<Record<string, string>> | undefined;
  readonly status: Status;
  /**
   * Where the golden is kept, when the story was drawn: in a mode, the
   * mode's own, which exists only while its picture differs from the base's.
   */
  readonly golden: string | undefined;
  /** What the screen showed, when the story was drawn. */
  readonly actual: Screenshot | undefined;
  /** What the golden holds, when there is one that reads. */
  readonly expected: Screenshot | undefined;
  /** The text a golden of the actual picture holds. */
  readonly text: string | undefined;
  /** What went wrong, and where, when the story threw. */
  readonly error: string | undefined;
}

/** A stories file that failed as a whole, as when it cannot be imported. */
export interface FileFailure {
  readonly file: string;
  readonly message: string;
}

/** A story's place in the matrix that its stories file leaves out, by its viewport and mode. */
export interface LeftOut {
  readonly viewportName: string;
  readonly mode: string;
}

/** One story of a component, with a picture for each viewport and mode. */
export interface CatalogStory {
  readonly name: string;
  readonly description: string | undefined;
  /** By viewport and mode, in the order they were drawn. */
  readonly pictures: readonly StoryRecord[];
  /** The places its `parameters.modes` leaves out. */
  readonly excluded: readonly LeftOut[];
  /** The worst of its pictures. */
  readonly status: Status;
}

/** A component's stories, under its group. */
export interface CatalogComponent {
  readonly title: string;
  readonly group: string;
  /** The title after its group. */
  readonly name: string;
  readonly file: string;
  readonly stories: readonly CatalogStory[];
  /** The worst of its stories. */
  readonly status: Status;
}

export interface CatalogGroup {
  readonly name: string;
  readonly components: readonly CatalogComponent[];
}

/** A mode the project draws every story in, with the globals it sets. */
export interface CatalogMode {
  readonly name: string;
  readonly globals: Readonly<Record<string, string>>;
}

/** A global the stories were drawn with, and every value they were drawn at, in the order first seen. */
export interface CatalogGlobal {
  readonly name: string;
  readonly values: readonly string[];
}

/** A cell the stories leave out, as a stories file's check of its goldens reports it. */
export interface ExcludedCell extends LeftOut {
  readonly title: string;
  readonly name: string;
}

/** What the catalog is built from beside the records and the failed files. */
export interface CatalogExtras {
  /** The project's modes, in its configuration's order. */
  readonly modes?: readonly CatalogMode[];
  /** The cells the stories leave out. */
  readonly excluded?: readonly ExcludedCell[];
}

/** Everything the run showed, as the gallery browses it. */
export interface Catalog {
  readonly groups: readonly CatalogGroup[];
  readonly failures: readonly FileFailure[];
  /** How many pictures stand in each state. */
  readonly tallies: Readonly<Record<Status, number>>;
  /** The viewports any story was drawn at, in the order first seen. */
  readonly viewports: readonly string[];
  /**
   * The modes, in the configuration's order, then any other a story was
   * drawn in; none for a project without modes.
   */
  readonly modes: readonly CatalogMode[];
  /** The globals the stories were drawn with, in the order first seen. */
  readonly globals: readonly CatalogGlobal[];
}
