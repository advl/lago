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

  it("resolves React and the renderer to the project's one copy, Lago's packages included", () => {
    const config = createConfig({ viewports });
    expect(config.resolve?.dedupe).toEqual([
      "react",
      "react-reconciler",
      "@opentui/core",
      "@opentui/react",
      "@opentui/keymap",
    ]);
    expect(config.test?.server?.deps?.inline).toEqual([/^@aztlan\//]);
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

  it("hands the project's preview to the plugin, which imports it into each stories file", () => {
    const [plugin] = createConfig({
      viewports,
      preview: "./src/lago.preview.tsx",
    }).plugins as { transform: (...given: unknown[]) => unknown }[];
    const result = plugin?.transform.call(
      { environment: { config: { root: "/project" } } },
      "export const Default = {};\n",
      "/project/src/Row.stories.tsx",
    );
    expect(result).toMatchObject({
      code: expect.stringContaining(
        'import * as __lagoPreview from "/project/src/lago.preview.tsx";',
      ),
    });
  });

  it("hands the modes and the matrix's bound to the plugin", () => {
    const [plugin] = createConfig({
      viewports,
      modes: { dark: { globals: { scheme: "dark" } } },
    }).plugins as { transform: (...given: unknown[]) => unknown }[];
    const result = plugin?.transform.call(
      { environment: { config: { root: "/project" } } },
      "export const Default = {};\n",
      "/project/src/Row.stories.tsx",
    );
    expect(result).toMatchObject({
      code: expect.stringContaining(
        '"modes":{"dark":{"globals":{"scheme":"dark"}}}',
      ),
    });
    expect(() => createConfig({ matrix: { max: 0 } })).toThrow(
      "matrix.max must be a whole number above 0",
    );
  });

  it("needs no options at all", () => {
    expect(createConfig().plugins).toMatchObject([
      { name: "lago:test-stories" },
      { name: "lago:cover-units-only" },
    ]);
  });

  it("carries the gallery's settings in a plugin of its own, only when given them", () => {
    const { plugins } = createConfig({
      viewports,
      gallery: { chrome: "dark" },
    });
    expect(plugins?.at(-1)).toEqual({
      name: "lago:gallery",
      api: { chrome: "dark" },
    });
    expect(createConfig({ viewports }).plugins).toHaveLength(2);
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

  it("leaves the preview out of coverage, as it leaves the stories", () => {
    expect(
      createConfig({ preview: "./src/lago.preview.tsx", coverage: true }).test
        ?.coverage,
    ).toMatchObject({
      exclude: expect.arrayContaining([
        "**/*.stories.tsx",
        "src/lago.preview.tsx",
      ]),
    });
  });

  it("refuses a preview named by an absolute path, which coverage could not leave out", () => {
    expect(() =>
      createConfig({ preview: "/project/src/lago.preview.tsx" }),
    ).toThrow(
      'The preview "/project/src/lago.preview.tsx" given to createConfig is an absolute path. Name it from the project\'s root, as in preview: "./src/lago.preview.tsx".',
    );
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
