import { describe, expect, it } from "vitest";
import type { TestModule } from "vitest/node";
import createMatrixReporter from "./createMatrixReporter.js";
import type { Cell, StoryResult } from "./types.js";

/** A module as the reporter reads it: its project's name and its tests' meta. */
const makeModule = (
  project: string,
  metas: readonly { lago?: Partial<StoryResult>; lagoExcluded?: Cell[] }[],
) =>
  ({
    project: { name: project },
    children: { allTests: () => metas.map((meta) => ({ meta: () => meta })) },
  }) as unknown as TestModule;

const dark = {
  mode: "dark",
  comparison: { equal: true, expectedToDiffer: false },
};

describe("createMatrixReporter", () => {
  it("prints the totals of the projects it counts once the run ends", () => {
    const lines: string[] = [];
    const reporter = createMatrixReporter(new Set(["stories"]), (line) =>
      lines.push(line),
    );
    reporter.onTestRunEnd?.(
      [
        makeModule("stories", [
          { lago: {} },
          { lago: dark },
          {
            lagoExcluded: [
              {
                title: "rows/Row",
                name: "Plain",
                viewportName: "narrow",
                mode: "dark",
              },
            ],
          },
        ]),
        makeModule("unit", [{ lago: {} }, { lago: dark }]),
      ],
      [],
      "passed",
    );
    expect(lines).toEqual([
      "Matrix: 2 pictures covered, 1 in the base and 1 in 1 mode: 0 distinct · 1 equal · 0 expected but equal · 1 excluded",
      "  dark  0 distinct · 1 equal · 0 expected but equal · 1 excluded",
    ]);
  });

  it("prints nothing for a run that drew no mode", () => {
    const lines: string[] = [];
    createMatrixReporter(new Set(["stories"]), (line) =>
      lines.push(line),
    ).onTestRunEnd?.([makeModule("stories", [{ lago: {} }, {}])], [], "passed");
    expect(lines).toEqual([]);
  });
});
