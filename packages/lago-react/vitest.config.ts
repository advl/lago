import { defineConfig } from "vitest/config";
import { stoppedTimers } from "./src/lib/render/constants.js";
import testStories from "./src/lib/vitest/testStories.js";

export default defineConfig({
  // This package's own plugin, from its source, over its own fixtures: the
  // stories under `testing/` are how the plugin is tested, so here, and only
  // here, coverage counts the stories project too. What they cover is the
  // code that registers and checks a story, not a component.
  plugins: [
    testStories({
      viewports: {
        narrow: { cols: 24, rows: 4 },
        wide: { cols: 40, rows: 4 },
      },
    }),
  ],
  // The components are drawn through the renderer's React reconciler, so JSX
  // takes its runtime from there.
  oxc: { jsx: { runtime: "automatic", importSource: "@opentui/react" } },
  // The renderer ships one build for Bun and one for Node. Bun loads the Bun
  // build for what vitest leaves to it, so the files vitest reads take it too:
  // two copies of the renderer's classes would not recognise each other's
  // objects.
  ssr: { resolve: { conditions: ["bun"] } },
  test: {
    // What a test fakes with `vi.useFakeTimers()`: what a story stops.
    fakeTimers: { toFake: [...stoppedTimers] },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}", "testing/**/*.test.ts"],
        },
      },
      {
        extends: true,
        test: { name: "stories", include: ["testing/**/*.stories.tsx"] },
      },
    ],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/index.ts",
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "**/types.ts",
        "src/vitest.ts",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
