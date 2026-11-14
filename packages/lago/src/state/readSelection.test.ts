import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import { buildCatalog } from "../catalog/index.js";
import { openingState } from "./constants.js";
import readSelection from "./readSelection.js";

const catalog = buildCatalog([
  makeRecord("component/KeyBar", "Default"),
  makeRecord("component/KeyBar", "Long", { lines: ["a long bar"] }),
  makeRecord("component/KeyBar", "Default", { viewportName: "wide" }),
  makeRecord("layout/Pane", "Empty"),
]);

describe("readSelection", () => {
  it("selects the first component, its first story and the first viewport as the gallery opens", () => {
    const selection = readSelection(openingState, catalog);
    expect(selection.components.map(({ name }) => name)).toEqual([
      "KeyBar",
      "Pane",
    ]);
    expect(selection).toMatchObject({
      story: 0,
      viewportName: "narrow",
      hits: [],
    });
    expect(selection.component?.name).toBe("KeyBar");
  });

  it("falls back to the first component when the selected one is gone, and holds the story and viewport in range", () => {
    const selection = readSelection(
      { ...openingState, title: "component/Gone", story: 5, viewport: 5 },
      catalog,
    );
    expect(selection).toMatchObject({ story: 1, viewportName: "wide" });
    expect(selection.component?.name).toBe("KeyBar");
  });

  it("selects among the components the filter leaves, and finds the search in the selected one", () => {
    expect(
      readSelection(
        { ...openingState, title: "component/KeyBar", filter: "pane" },
        catalog,
      ).component?.name,
    ).toBe("Pane");
    expect(
      readSelection({ ...openingState, search: "long" }, catalog).hits,
    ).toEqual([
      { story: 1, field: "name" },
      { story: 1, field: "picture", line: 0 },
    ]);
  });

  it("selects nothing in a catalog with no stories", () => {
    expect(
      readSelection({ ...openingState, search: "x" }, buildCatalog([])),
    ).toEqual({
      components: [],
      component: undefined,
      story: 0,
      viewportName: undefined,
      record: undefined,
      hits: [],
      hit: 0,
      confirming: undefined,
    });
  });
  it("gives the selected story's picture at the viewport shown, and none where it is not drawn", () => {
    expect(readSelection(openingState, catalog).record?.name).toBe("Default");
    expect(
      readSelection({ ...openingState, story: 1, viewport: 1 }, catalog).record,
    ).toBeUndefined();
  });

  it("holds the current hit within the hits a catalog gives", () => {
    expect(
      readSelection({ ...openingState, search: "long", hit: 5 }, catalog).hit,
    ).toBe(1);
    expect(readSelection({ ...openingState, hit: 5 }, catalog).hit).toBe(0);
  });

  it("gives the picture asked to be accepted only while it is still the selected one", () => {
    const asked = {
      ...openingState,
      story: 1,
      confirming: {
        title: "component/KeyBar",
        story: "Long",
        viewportName: "narrow",
        text: "a long bar",
      },
    };
    expect(readSelection(asked, catalog).confirming?.name).toBe("Long");
    expect(
      readSelection({ ...asked, story: 0 }, catalog).confirming,
    ).toBeUndefined();
    expect(
      readSelection(
        { ...asked, confirming: { ...asked.confirming, title: "layout/Pane" } },
        catalog,
      ).confirming,
    ).toBeUndefined();
    expect(
      readSelection(
        { ...asked, confirming: { ...asked.confirming, story: "Default" } },
        catalog,
      ).confirming,
    ).toBeUndefined();
    expect(
      readSelection(
        { ...asked, confirming: { ...asked.confirming, viewportName: "wide" } },
        catalog,
      ).confirming,
    ).toBeUndefined();
    expect(
      readSelection(
        { ...asked, confirming: { ...asked.confirming, text: "drawn before" } },
        catalog,
      ).confirming,
    ).toBeUndefined();
  });
});
