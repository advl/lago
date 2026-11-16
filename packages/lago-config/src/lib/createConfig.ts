import { isAbsolute, posix } from "node:path";
import { renderer, testStories } from "@aztlan/lago-react/vitest";
import type { ViteUserConfig } from "vitest/config";
import { fakedTimers } from "./constants.js";
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
 * package linked from a checkout; a `unit` project over the tests under
 * `src/` and a `stories` project over the stories files there; the plugin
 * that makes each story a test, inside the project's preview when one is
 * named and in each of its modes; the timers a test fakes; and, when asked,
 * the coverage settings, which a run applies to the unit project alone.
 */
export default function createConfig({
  viewports,
  coverage = false,
  preview,
  modes,
  matrix,
}: Options = {}): ViteUserConfig {
  // Coverage matches what it leaves out against paths from the project's
  // root, so an absolute path would leave the preview measured.
  if (preview !== undefined && isAbsolute(preview)) {
    throw new Error(
      `The preview ${JSON.stringify(preview)} given to createConfig is an absolute path. Name it from the project's root, as in preview: "./src/lago.preview.tsx".`,
    );
  }
  return {
    plugins: [
      testStories({ viewports, preview, modes, matrix }),
      coverUnitsOnly,
    ],
    // What names the renderer comes from the renderer's own package: where
    // JSX takes its runtime, the build vitest must load, and what is kept to
    // one copy.
    oxc: {
      jsx: { runtime: "automatic", importSource: renderer.jsxImportSource },
    },
    ssr: { resolve: { conditions: [...renderer.conditions] } },
    // Lago's own packages are read by vitest, so their imports of React and
    // the renderer resolve from the project, to the project's one copy, even
    // when a package is linked from a checkout of Lago.
    resolve: { dedupe: [...renderer.sharedPackages] },
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
            // The preview is drawn around the stories alone, as they are.
            ...(preview === undefined ? [] : [posix.normalize(preview)]),
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
