import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import { buildCatalog } from "../catalog/index.js";
import findHits from "./findHits.js";

const catalog = buildCatalog([
  makeRecord("component/Row", "Parser", {
    lines: ["fix the parser", "", "no"],
  }),
  makeRecord("component/Row", "Plain", {
    description: "A parser-free row.",
    lines: ["a row"],
  }),
  makeRecord("component/Row", "Plain", {
    viewportName: "wide",
    lines: ["PARSER at wide"],
  }),
  makeRecord("component/Row", "Thrown", { status: "error", actual: undefined }),
]);
const row = catalog.groups.at(0)?.components.at(0);

describe("findHits", () => {
  it("finds the query in names, descriptions and drawn lines, ignoring case, in the stories' order", () => {
    if (!row) throw new Error("no component");
    expect(findHits(row, "narrow", "PARSER")).toEqual([
      { story: 0, field: "name" },
      { story: 0, field: "picture", line: 0 },
      { story: 1, field: "description" },
    ]);
  });

  it("reads the pictures of the viewport asked for", () => {
    if (!row) throw new Error("no component");
    expect(findHits(row, "wide", "at wide")).toEqual([
      { story: 1, field: "picture", line: 0 },
    ]);
  });

  it("finds nothing for an empty query", () => {
    if (!row) throw new Error("no component");
    expect(findHits(row, "narrow", "")).toEqual([]);
  });
});
