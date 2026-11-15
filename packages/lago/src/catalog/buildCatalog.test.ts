import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import buildCatalog from "./buildCatalog.js";

describe("buildCatalog", () => {
  const records = [
    makeRecord("layout/Pane", "Help"),
    makeRecord("component/KeyBar", "Owed", { description: "The first mode." }),
    makeRecord("component/KeyBar", "Owed", {
      viewportName: "wide",
      status: "changed",
    }),
    makeRecord("component/KeyBar", "Long", { status: "new" }),
    makeRecord("component/Badge", "Default", {
      status: "error",
      actual: undefined,
    }),
    makeRecord("Lonely", "Default"),
  ];
  const catalog = buildCatalog(records, [
    { file: "/project/src/Broken.stories.tsx", message: "cannot import" },
  ]);

  it("groups components by the first part of their titles, both in alphabetical order, ignoring case", () => {
    expect(
      catalog.groups.map(({ name, components }) => [
        name,
        components.map((each) => each.name),
      ]),
    ).toEqual([
      ["component", ["Badge", "KeyBar"]],
      ["layout", ["Pane"]],
      ["Lonely", ["Lonely"]],
    ]);
  });

  it("keeps a component's stories and their pictures in the order the run drew them", () => {
    const keyBar = catalog.groups.at(0)?.components.at(1);
    expect(keyBar?.stories.map(({ name }) => name)).toEqual(["Owed", "Long"]);
    expect(
      keyBar?.stories.at(0)?.pictures.map(({ viewportName }) => viewportName),
    ).toEqual(["narrow", "wide"]);
    expect(keyBar?.stories.at(0)?.description).toBe("The first mode.");
    expect(keyBar?.file).toBe("/project/src/KeyBar.stories.tsx");
  });

  it("gives a story the worst of its pictures, and a component the worst of its stories", () => {
    const keyBar = catalog.groups.at(0)?.components.at(1);
    expect(keyBar?.stories.map(({ status }) => status)).toEqual([
      "changed",
      "new",
    ]);
    expect(keyBar?.status).toBe("changed");
    expect(catalog.groups.at(0)?.components.at(0)?.status).toBe("error");
  });

  it("counts the pictures in each state, and lists the viewports in the order first seen", () => {
    expect(catalog.tallies).toEqual({ pass: 3, changed: 1, new: 1, error: 1 });
    expect(catalog.viewports).toEqual(["narrow", "wide"]);
  });

  it("carries the files that failed as a whole", () => {
    expect(catalog.failures).toEqual([
      { file: "/project/src/Broken.stories.tsx", message: "cannot import" },
    ]);
  });

  it("gives an empty catalog for an empty run", () => {
    expect(buildCatalog([])).toEqual({
      groups: [],
      failures: [],
      tallies: { pass: 0, changed: 0, new: 0, error: 0 },
      viewports: [],
    });
  });
  it("orders groups by their own names, whatever follows them in a title", () => {
    const catalog = buildCatalog([
      makeRecord("form/Zed", "Default"),
      makeRecord("form-field/Label", "Default"),
      makeRecord("form/Input", "Default"),
    ]);
    expect(
      catalog.groups.map(({ name, components }) => [
        name,
        components.map((component) => component.name),
      ]),
    ).toEqual([
      ["form", ["Input", "Zed"]],
      ["form-field", ["Label"]],
    ]);
  });
});
