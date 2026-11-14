import { describe, expect, it } from "vitest";
import resolveViewports from "./resolveViewports.js";

const configured = {
  narrow: { cols: 40, rows: 36 },
  wide: { cols: 60, rows: 36 },
};
const where = "fixtures/Row Short";

describe("resolveViewports", () => {
  it("gives the configured viewports to a story that names none", () => {
    expect(resolveViewports(configured, undefined, where)).toEqual(configured);
  });

  it("changes a configured viewport by what the story gives under its name", () => {
    expect(
      resolveViewports(
        configured,
        { narrow: { rows: 12 }, wide: { rows: 12 } },
        where,
      ),
    ).toEqual({ narrow: { cols: 40, rows: 12 }, wide: { cols: 60, rows: 12 } });
  });

  it("adds a viewport under a new name, after the configured ones", () => {
    const sizes = resolveViewports(
      configured,
      { tooNarrow: { cols: 32, rows: 36 } },
      where,
    );
    expect(Object.entries(sizes)).toEqual([
      ["narrow", { cols: 40, rows: 36 }],
      ["wide", { cols: 60, rows: 36 }],
      ["tooNarrow", { cols: 32, rows: 36 }],
    ]);
  });

  it.each([
    [
      "something other than an object",
      12,
      "must be an object of viewports by name",
    ],
    [
      "a list",
      [{ cols: 1, rows: 1 }],
      "must be an object of viewports by name",
    ],
    [
      "a name that cannot be part of a file's name",
      { "a.b": { cols: 1, rows: 1 } },
      'names "a.b", which cannot be part of a file\'s name',
    ],
    [
      "a new viewport without its lines",
      { short: { cols: 40 } },
      "gives short no size it can be drawn at: a new viewport needs cols and rows",
    ],
    [
      "a new viewport that is not an object",
      { short: 40 },
      "gives short no size it can be drawn at",
    ],
    [
      "a size that is not a whole number above 0",
      { narrow: { rows: 0 } },
      "gives narrow no size it can be drawn at: a change needs whole numbers above 0",
    ],
    [
      "a size that is not a number",
      { narrow: { cols: "40" } },
      "gives narrow no size it can be drawn at",
    ],
  ])("refuses %s, naming the story", (_, asked, message) => {
    expect(() => resolveViewports(configured, asked, where)).toThrow(
      `fixtures/Row Short: parameters.viewports ${message}`,
    );
  });
});
