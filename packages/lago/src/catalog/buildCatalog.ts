import findWorst from "./findWorst.js";
import type {
  Catalog,
  CatalogComponent,
  CatalogExtras,
  CatalogGlobal,
  CatalogGroup,
  CatalogMode,
  CatalogStory,
  ExcludedCell,
  FileFailure,
  Status,
  StoryRecord,
} from "./types.js";

/** `group/Component` split at its first slash; a title without one is its own group. */
function splitTitle(title: string): { group: string; name: string } {
  const at = title.indexOf("/");
  return at < 0
    ? { group: title, name: title }
    : { group: title.slice(0, at), name: title.slice(at + 1) };
}

/**
 * The records of one component as its stories, each with its pictures, in
 * the order drawn, and the cells its file leaves out.
 */
function collectStories(
  records: readonly StoryRecord[],
  excluded: readonly ExcludedCell[],
): CatalogStory[] {
  const stories = new Map<string, StoryRecord[]>();
  for (const record of records) {
    stories.set(record.name, [...(stories.get(record.name) ?? []), record]);
  }
  return [...stories].map(([name, pictures]) => ({
    name,
    description: pictures.find((each) => each.description)?.description,
    pictures,
    excluded: excluded
      .filter((cell) => cell.name === name)
      .map(({ viewportName, mode }) => ({ viewportName, mode })),
    status: findWorst(pictures.map(({ status }) => status)),
  }));
}

/** The configured modes, then any other a record was drawn in, in the order first seen. */
function listModes(
  configured: readonly CatalogMode[],
  records: readonly StoryRecord[],
): CatalogMode[] {
  const known = new Set(configured.map(({ name }) => name));
  const others = new Set(
    records.flatMap(({ mode }) =>
      mode === undefined || known.has(mode) ? [] : [mode],
    ),
  );
  return [...configured, ...[...others].map((name) => ({ name, globals: {} }))];
}

/** Every global the records were drawn with, and its values, each in the order first seen. */
function listGlobals(records: readonly StoryRecord[]): CatalogGlobal[] {
  const globals = new Map<string, Set<string>>();
  for (const { globals: drawn = {} } of records) {
    for (const [name, value] of Object.entries(drawn)) {
      globals.set(name, (globals.get(name) ?? new Set()).add(value));
    }
  }
  return [...globals].map(([name, values]) => ({ name, values: [...values] }));
}

/**
 * Everything a test run showed, as the gallery browses it: groups by the
 * first part of each title, in alphabetical order, and under each its
 * components, likewise; a component's stories and their pictures keep the
 * order the run drew them in, which is the order of the file. A story's
 * pictures are kept by viewport and mode, with the cells it leaves out.
 */
export default function buildCatalog(
  records: readonly StoryRecord[],
  failures: readonly FileFailure[] = [],
  { modes = [], excluded = [] }: CatalogExtras = {},
): Catalog {
  const byTitle = new Map<string, readonly [StoryRecord, ...StoryRecord[]]>();
  for (const record of records) {
    const own = byTitle.get(record.title);
    byTitle.set(record.title, own ? [...own, record] : [record]);
  }
  const components: CatalogComponent[] = [...byTitle].map(([title, own]) => {
    const [first] = own;
    const stories = collectStories(
      own,
      excluded.filter((cell) => cell.title === title),
    );
    return {
      title,
      ...splitTitle(title),
      file: first.file,
      stories,
      status: findWorst(stories.map(({ status }) => status)),
    };
  });
  const groups = new Map<string, CatalogComponent[]>();
  for (const component of components.sort(
    (one, other) =>
      one.group.localeCompare(other.group) ||
      one.name.localeCompare(other.name),
  )) {
    groups.set(component.group, [
      ...(groups.get(component.group) ?? []),
      component,
    ]);
  }
  const tallies: Record<Status, number> = {
    pass: 0,
    changed: 0,
    new: 0,
    error: 0,
  };
  for (const { status } of records) tallies[status] += 1;
  return {
    groups: [...groups].map(
      ([name, own]): CatalogGroup => ({ name, components: own }),
    ),
    failures,
    tallies,
    viewports: [...new Set(records.map(({ viewportName }) => viewportName))],
    modes: listModes(modes, records),
    globals: listGlobals(records),
  };
}
