import { defineConfig } from "vitest/config";
import { stoppedTimers } from "./src/lib/render/constants.js";

export default defineConfig({
  // The components are drawn through the renderer's React reconciler, so JSX
  // takes its runtime from there.
  oxc: { jsx: { runtime: "automatic", importSource: "@opentui/react" } },
  // The renderer ships one build for Bun and one for Node. Bun loads the Bun
  // build for what vitest leaves to it, so the files vitest reads take it too:
  // two copies of the renderer's classes would not recognise each other's
  // objects.
  ssr: { resolve: { conditions: ["bun"] } },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "testing/**/*.test.ts"],
    // What a test fakes with `vi.useFakeTimers()`: the timers a component can
    // wait on, the clock and the high-resolution clock. `setImmediate` stays
    // real, because React waits on it to know that an update has been
    // committed.
    fakeTimers: { toFake: [...stoppedTimers] },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/index.ts",
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "**/types.ts",
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
