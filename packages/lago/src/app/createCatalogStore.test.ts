import { describe, expect, it, vi } from "vitest";
import { passingCatalog } from "../../testing/catalogs.js";
import createCatalogStore from "./createCatalogStore.js";

describe("createCatalogStore", () => {
  it("gives nothing until a catalog comes, then the latest, telling each listener until it is removed", () => {
    const store = createCatalogStore();
    const listen = vi.fn();
    expect(store.read()).toBeUndefined();
    const remove = store.subscribe(listen);
    store.give(passingCatalog);
    expect(store.read()).toBe(passingCatalog);
    remove();
    store.give(passingCatalog);
    expect(listen).toHaveBeenCalledOnce();
  });
});
