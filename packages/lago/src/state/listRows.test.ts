import { describe, expect, it } from "vitest";
import { modesCatalog } from "../../testing/catalogs.js";
import { filterComponents } from "../search/index.js";
import listRows from "./listRows.js";

describe("listRows", () => {
  it("gives every story of each component, in the tree's order, with its place", () => {
    expect(
      listRows(filterComponents(modesCatalog, "")).map(
        ({ component, story, place }) =>
          `${component.name} ${story.name} ${place}`,
      ),
    ).toEqual([
      "Badge Default 0",
      "Badge Loud 1",
      "Badge Quiet 2",
      "Badge Thrown 3",
      "Card Default 0",
    ]);
  });
});
