import { describe, expect, it } from "vitest";
import createConfig from "./createConfig.js";

const viewports = { narrow: { cols: 40, rows: 36 } };

describe("createConfig", () => {
  it("compiles JSX against the renderer and loads the renderer's Bun build", () => {
    expect(createConfig({ viewports })).toMatchObject({
      oxc: { jsx: { runtime: "automatic", importSource: "@opentui/react" } },
      ssr: { resolve: { conditions: ["bun"] } },
    });
  });

  it("installs the plugin that makes each story a test, with the viewports", () => {
    const { plugins } = createConfig({ viewports });
    expect(plugins).toMatchObject([
      { name: "lago:test-stories" },
      { name: "lago:cover-units-only" },
    ]);
    expect(() => createConfig({ viewports: {} })).toThrow(
      "testStories was given an empty set of viewports.",
    );
  });

  it("needs no options at all", () => {
    expect(createConfig().plugins).toMatchObject([
      { name: "lago:test-stories" },
      { name: "lago:cover-units-only" },
    ]);
  });

  it("keeps tests and stories in a project each, so a run can leave one out", () => {
    expect(createConfig({ viewports }).test?.projects).toEqual([
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.{ts,tsx}"] },
      },
      {
        extends: true,
        test: { name: "stories", include: ["src/**/*.stories.tsx"] },
      },
    ]);
  });

  it("has a test fake the timers a component waits on, and leave real the one React waits on", () => {
    expect(createConfig({ viewports }).test?.fakeTimers?.toFake).toEqual([
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "Date",
      "performance",
    ]);
  });

  it("sets up coverage only when asked: v8 over src, with a floor of 100%", () => {
    expect(createConfig({ viewports }).test).not.toHaveProperty("coverage");
    expect(createConfig({ viewports, coverage: true }).test?.coverage).toEqual({
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/index.ts",
        "**/types.ts",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.stories.tsx",
        "src/testing/**",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    });
  });
});
