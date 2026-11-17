import { describe, expect, it } from "vitest";
import { modesCatalog, sampleCatalog } from "../../testing/catalogs.js";
import listColumns from "./listColumns.js";

describe("listColumns", () => {
  it("gives each viewport in the base and then in each mode, in order", () => {
    expect(
      listColumns(modesCatalog).map(
        ({ viewportName, mode }) => `${viewportName}@${mode}`,
      ),
    ).toEqual([
      "terminal@undefined",
      "terminal@dark",
      "terminal@ascii",
      "wide@undefined",
      "wide@dark",
      "wide@ascii",
    ]);
  });

  it("gives the viewports alone in a project with no modes", () => {
    expect(listColumns(sampleCatalog)).toEqual([
      { viewportName: "terminal", mode: undefined },
      { viewportName: "wide", mode: undefined },
    ]);
  });
});
