import type { Catalog } from "../catalog/index.js";

/**
 * A store of the latest catalog, in the shape React's
 * `useSyncExternalStore` reads: `give` keeps a catalog and tells every
 * listener, `read` gives the latest, and `subscribe` adds a listener and
 * gives what removes it.
 *
 * @note Impure: keeps the latest catalog and its listeners between calls.
 */
export default function createCatalogStore() {
  const listeners = new Set<() => void>();
  let latest: Catalog | undefined;
  return {
    give: (catalog: Catalog) => {
      latest = catalog;
      for (const listen of listeners) listen();
    },
    read: () => latest,
    subscribe: (listen: () => void) => {
      listeners.add(listen);
      return () => {
        listeners.delete(listen);
      };
    },
  };
}
