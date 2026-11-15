import { testStories } from "@aztlan/lago-react/vitest";
import type { ViteUserConfig } from "vitest/config";
import { fakedTimers, sharedPackages } from "./constants.js";
import coverUnitsOnly from "./coverUnitsOnly.js";
import type { Options } from "./types.js";

/**
 * The vitest configuration a project with OpenTUI components and Lago stories
 * needs, to export from its `vitest.config.ts`. A project with more to say
 * merges its own settings over it with vitest's `mergeConfig`.
 *
 * It holds: JSX compiled against the renderer's React reconciler; the
 * renderer's Bun build, so that vitest and the runtime load the same classes;
 * one copy of React and of the renderer, the project's, even for a Lago
 * package linked from a checkout;
 * a `unit` project over the tests under `src/` and a `stories` project over
 * the stories files there; the plugin that makes each story a test; the
 * timers a test fakes; and, when asked, the coverage settings, which a run
 * applies to the unit project alone.
 */
export default function createConfig({
  viewports,
  coverage = false,
}: Options = {}): ViteUserConfig {
  return {
    plugins: [testStories({ viewports }), coverUnitsOnly],
    oxc: { jsx: { runtime: "automatic", importSource: "@opentui/react" } },
    // The renderer ships one build for Bun and one for Node. Bun loads the
    // Bun build for what vitest leaves to it, so the files vitest reads take
    // it too: an object made by one build is not recognised by the other.
    ssr: { resolve: { conditions: ["bun"] } },
    // Lago's own packages are read by vitest, so their imports of React and
    // the renderer resolve from the project, to the project's one copy, even
    // when a package is linked from a checkout of Lago.
    resolve: { dedupe: [...sharedPackages] },
    test: {
      server: { deps: { inline: [/^@aztlan\//] } },
      fakeTimers: { toFake: [...fakedTimers] },
      // Stories are a project of their own, so a run can leave them out, as
      // one that measures the unit tests' coverage does.
      projects: [
        {
          extends: true,
          test: { name: "unit", include: ["src/**/*.test.{ts,tsx}"] },
        },
        {
          extends: true,
          test: { name: "stories", include: ["src/**/*.stories.tsx"] },
        },
      ],
      ...(coverage && {
        coverage: {
          provider: "v8" as const,
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
        },
      }),
    },
  };
}
