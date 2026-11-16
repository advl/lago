import { describe, expect, it, vi } from "vitest";
import type { TestModule, Vitest } from "vitest/node";
import addMatrixReporter from "./addMatrixReporter.js";

/** The part of vitest the reporter is added to. */
const makeVitest = () => ({
  config: { reporters: [] as unknown[] } as unknown as Vitest["config"],
  logger: { log: vi.fn() } as unknown as Vitest["logger"],
});

const makeModule = (project: string) =>
  ({
    project: { name: project },
    children: {
      allTests: () => [
        {
          meta: () => ({
            lago: {
              mode: "dark",
              comparison: { equal: false, expectedToDiffer: false },
            },
          }),
        },
      ],
    },
  }) as unknown as TestModule;

describe("addMatrixReporter", () => {
  it("adds one reporter for a run, counting every project that asks, and prints through vitest's logger", () => {
    const vitest = makeVitest();
    addMatrixReporter(vitest, "stories");
    addMatrixReporter(vitest, "more");
    expect(vitest.config.reporters).toHaveLength(1);
    const [reporter] = vitest.config.reporters as unknown as {
      onTestRunEnd: (modules: TestModule[]) => void;
    }[];
    reporter?.onTestRunEnd([
      makeModule("stories"),
      makeModule("more"),
      makeModule("unit"),
    ]);
    expect(vitest.logger.log).toHaveBeenCalledWith(
      "  dark  2 distinct · 0 equal · 0 expected but equal · 0 excluded",
    );
  });

  it("adds a reporter again to the configuration vitest resolves when it restarts", () => {
    const vitest = makeVitest();
    addMatrixReporter(vitest, "stories");
    const restarted = makeVitest();
    addMatrixReporter(restarted, "stories");
    expect(vitest.config.reporters).toHaveLength(1);
    expect(restarted.config.reporters).toHaveLength(1);
  });
});
