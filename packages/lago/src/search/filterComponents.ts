import type { Catalog, CatalogComponent } from "../catalog/index.js";
import rankName from "./rankName.js";

/**
 * The catalog's components whose name or title answers `query`, best first,
 * and in the catalog's order among equals; every component when the query
 * is empty.
 */
export default function filterComponents(
  catalog: Catalog,
  query: string,
): CatalogComponent[] {
  const components = catalog.groups.flatMap(({ components }) => components);
  if (query === "") return components;
  return components
    .map((component, place) => ({
      component,
      place,
      rank: Math.max(
        rankName(component.name, query),
        rankName(component.title, query),
      ),
    }))
    .filter(({ rank }) => rank > 0)
    .sort((one, other) => other.rank - one.rank || one.place - other.place)
    .map(({ component }) => component);
}
