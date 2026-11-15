import findWorst from "./findWorst.js";
import type {
  Catalog,
  CatalogComponent,
  CatalogGroup,
  CatalogStory,
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

/** The records of one component as its stories, each with its pictures, in the order drawn. */
function collectStories(records: readonly StoryRecord[]): CatalogStory[] {
  const stories = new Map<string, StoryRecord[]>();
  for (const record of records) {
    stories.set(record.name, [...(stories.get(record.name) ?? []), record]);
  }
  return [...stories].map(([name, pictures]) => ({
    name,
    description: pictures.find((each) => each.description)?.description,
    pictures,
    status: findWorst(pictures.map(({ status }) => status)),
  }));
}

/**
 * Everything a test run showed, as the gallery browses it: groups by the
 * first part of each title, in alphabetical order, and under each its
 * components, likewise; a component's stories and their pictures keep the
 * order the run drew them in, which is the order of the file.
 */
export default function buildCatalog(
  records: readonly StoryRecord[],
  failures: readonly FileFailure[] = [],
): Catalog {
  const byTitle = new Map<string, readonly [StoryRecord, ...StoryRecord[]]>();
  for (const record of records) {
    const own = byTitle.get(record.title);
    byTitle.set(record.title, own ? [...own, record] : [record]);
  }
  const components: CatalogComponent[] = [...byTitle].map(([title, own]) => {
    const [first] = own;
    const stories = collectStories(own);
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
  };
}
