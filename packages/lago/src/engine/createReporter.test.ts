import type { Cell } from "@aztlan/lago-react/vitest";
import { describe, expect, it } from "vitest";
import type { TestModule } from "vitest/node";
import { drawPicture } from "../../testing/records.js";
import type { Catalog } from "../catalog/index.js";
import createReporter from "./createReporter.js";

/** A stand-in for vitest's test module of one stories file. */
function makeModule(
  file: string,
  tests: {
    name: string;
    state: "passed" | "failed";
    story?: boolean;
    excluded?: Cell[];
  }[],
  errors: { message: string }[] = [],
): TestModule {
  const title = "component/Row";
  return {
    moduleId: file,
    errors: () => errors,
    children: {
      *allTests() {
        for (const { name, state, story, excluded } of tests) {
          const [storyName = "", viewportName = ""] = name.split(" at ");
          yield {
            name,
            parent: { type: "suite", name: title },
            result: () => ({ state, errors: [] }),
            meta: () => ({
              lago: story
                ? {
                    file,
                    title,
                    name: storyName,
                    description: undefined,
                    tags: [],
                    viewportName,
                    golden: `${file}.${storyName}.golden`,
                    actual: drawPicture([storyName]),
                    text: storyName,
                    expected: undefined,
                  }
                : undefined,
              lagoExcluded: excluded,
            }),
          };
        }
      },
    },
  } as unknown as TestModule;
}

describe("createReporter", () => {
  it("gives the whole catalog after every run, keeping the files a run did not cover", () => {
    const catalogs: Catalog[] = [];
    const reporter = createReporter(
      "/project",
      () => true,
      (catalog) => catalogs.push(catalog),
    );
    const run = (modules: TestModule[]) =>
      reporter.onTestRunEnd?.(modules, [], "passed");
    run([
      makeModule("/project/a.stories.tsx", [
        { name: "One at narrow", state: "passed", story: true },
        { name: "keeps no golden that no story owns", state: "passed" },
      ]),
      makeModule("/project/b.stories.tsx", [], [{ message: "cannot import" }]),
    ]);
    run([
      makeModule("/project/a.stories.tsx", [
        { name: "One at narrow", state: "failed", story: true },
      ]),
    ]);
    expect(catalogs).toHaveLength(2);
    const [first, second] = catalogs;
    expect(first?.tallies).toMatchObject({ pass: 1 });
    expect(first?.failures).toEqual([
      { file: "/project/b.stories.tsx", message: "cannot import" },
    ]);
    expect(second?.tallies).toMatchObject({ pass: 0, changed: 1 });
    expect(second?.failures).toHaveLength(1);
  });

  it("reads a test outside a suite with no title of its own", () => {
    const catalogs: Catalog[] = [];
    const reporter = createReporter(
      "/project",
      () => false,
      (catalog) => catalogs.push(catalog),
    );
    const module = {
      moduleId: "/project/c.stories.tsx",
      errors: () => [],
      children: {
        *allTests() {
          yield {
            name: "Lost at narrow",
            parent: { type: "module" },
            result: () => ({ state: "failed" }),
            meta: () => ({}),
          };
        },
      },
    } as unknown as TestModule;
    reporter.onTestRunEnd?.([module], [], "failed");
    expect(catalogs.at(0)?.groups.at(0)?.name).toBe("");
    expect(catalogs.at(0)?.tallies.error).toBe(1);
  });
  it("drops a removed file's stories at once, and gives nothing for a file it never ran", () => {
    const catalogs: Catalog[] = [];
    const reporter = createReporter(
      "/project",
      () => true,
      (catalog) => catalogs.push(catalog),
    );
    reporter.onTestRunEnd?.(
      [
        makeModule("/project/a.stories.tsx", [
          { name: "One at narrow", state: "passed", story: true },
        ]),
      ],
      [],
      "passed",
    );
    reporter.onTestRemoved?.("/project/b.stories.tsx");
    reporter.onTestRemoved?.(undefined);
    expect(catalogs).toHaveLength(1);
    reporter.onTestRemoved?.("/project/a.stories.tsx");
    expect(catalogs).toHaveLength(2);
    expect(catalogs.at(1)?.groups).toEqual([]);
  });

  it("gives the modes it is told of, and the cells each file's check reports left out", () => {
    const catalogs: Catalog[] = [];
    const reporter = createReporter(
      "/project",
      () => true,
      (catalog) => catalogs.push(catalog),
      () => [{ name: "dark", globals: { scheme: "dark" } }],
    );
    const left = {
      title: "component/Row",
      name: "One",
      viewportName: "narrow",
      mode: "dark",
    };
    reporter.onTestRunEnd?.(
      [
        makeModule("/project/a.stories.tsx", [
          { name: "One at narrow", state: "passed", story: true },
          {
            name: "keeps no golden that no story owns",
            state: "passed",
            excluded: [left],
          },
        ]),
      ],
      [],
      "passed",
    );
    const catalog = catalogs.at(0);
    expect(catalog?.modes.map(({ name }) => name)).toEqual(["dark"]);
    expect(
      catalog?.groups.at(0)?.components.at(0)?.stories.at(0)?.excluded,
    ).toEqual([{ viewportName: "narrow", mode: "dark" }]);
  });
});
