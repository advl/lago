import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import { buildCatalog } from "../catalog/index.js";
import filterComponents from "./filterComponents.js";

const catalog = buildCatalog([
  makeRecord("component/KeyBar", "Default"),
  makeRecord("component/HotKeys", "Default"),
  makeRecord("layout/Pane", "Default"),
]);

describe("filterComponents", () => {
  it("gives every component, in the catalog's order, for an empty query", () => {
    expect(filterComponents(catalog, "").map(({ name }) => name)).toEqual([
      "HotKeys",
      "KeyBar",
      "Pane",
    ]);
  });

  it("gives the components whose name or title answers the query, best first", () => {
    expect(filterComponents(catalog, "key").map(({ name }) => name)).toEqual([
      "KeyBar",
      "HotKeys",
    ]);
    expect(filterComponents(catalog, "layout").map(({ name }) => name)).toEqual(
      ["Pane"],
    );
    expect(
      filterComponents(catalog, "component").map(({ name }) => name),
    ).toEqual(["HotKeys", "KeyBar"]);
    expect(filterComponents(catalog, "zz")).toEqual([]);
  });
});
