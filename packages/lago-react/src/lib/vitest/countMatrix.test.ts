import { describe, expect, it } from "vitest";
import countMatrix from "./countMatrix.js";
import type { StoryResult } from "./types.js";

/** A story's result, holding only what the count reads. */
const makeResult = (
  mode?: string,
  equal?: boolean,
  expectedToDiffer = false,
): StoryResult =>
  ({
    mode,
    ...(equal !== undefined && { comparison: { equal, expectedToDiffer } }),
  }) as StoryResult;

describe("countMatrix", () => {
  it("counts the base pictures, and each mode's equal, distinct, unreached and excluded cells, in the order met", () => {
    const totals = countMatrix(
      [
        makeResult(),
        makeResult(),
        makeResult("dark", true),
        makeResult("dark", false),
        makeResult("ascii", true, true),
        makeResult("dark", true),
      ],
      [
        {
          title: "rows/Row",
          name: "Plain",
          viewportName: "narrow",
          mode: "dim",
        },
      ],
    );
    expect(totals).toEqual({
      base: 2,
      modes: {
        dark: { equal: 2, distinct: 1, unreached: 0, excluded: 0 },
        ascii: { equal: 0, distinct: 0, unreached: 1, excluded: 0 },
        dim: { equal: 0, distinct: 0, unreached: 0, excluded: 1 },
      },
    });
    expect(Object.keys(totals.modes)).toEqual(["dark", "ascii", "dim"]);
  });

  it("counts no mode for a run in none", () => {
    expect(countMatrix([makeResult()], [])).toEqual({ base: 1, modes: {} });
  });
});
