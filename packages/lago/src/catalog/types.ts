import type { Screenshot } from "@aztlan/lago-react";

/**
 * Where a story's picture stands against its golden: the same (`pass`),
 * different (`changed`), with no golden yet (`new`), or not drawn at all
 * because the story threw (`error`).
 */
export type Status = "pass" | "changed" | "new" | "error";

/** One story drawn at one viewport, as the test run left it. */
export interface StoryRecord {
  /** The stories file. */
  readonly file: string;
  /** The file's title, as `group/Component`. */
  readonly title: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly viewportName: string;
  readonly status: Status;
  /** Where the golden is kept, when the story was drawn. */
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

/** One story of a component, with a picture for each viewport. */
export interface CatalogStory {
  readonly name: string;
  readonly description: string | undefined;
  /** By viewport, in the order they were drawn. */
  readonly pictures: readonly StoryRecord[];
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

/** Everything the run showed, as the gallery browses it. */
export interface Catalog {
  readonly groups: readonly CatalogGroup[];
  readonly failures: readonly FileFailure[];
  /** How many pictures stand in each state. */
  readonly tallies: Readonly<Record<Status, number>>;
  /** The viewports any story was drawn at, in the order first seen. */
  readonly viewports: readonly string[];
}
