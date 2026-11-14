import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createVitest } from "vitest/node";
import { buildCatalog } from "../catalog/index.js";
import { storiesProject } from "./constants.js";
import createReporter from "./createReporter.js";
import createSink from "./createSink.js";
import type { Engine, EngineOptions } from "./types.js";

/**
 * Starts the project's own vitest from code, on its own configuration,
 * running the stories project alone, in watch mode, and never writing a
 * golden: a run that finds one missing or changed reports it, and only
 * `accept` writes one. Every run's results reach `onCatalog`, and a project
 * with no stories gives one empty catalog.
 *
 * @note Impure: starts vitest, which watches and reads the project, and writes a golden when one is accepted.
 */
export default async function startEngine({
  root,
  onCatalog,
}: EngineOptions): Promise<Engine> {
  const vitest = await createVitest(
    {
      root,
      watch: true,
      project: [storiesProject],
      update: "none",
      // A project's own bail would leave the stories after a failure
      // unrun, and the gallery would show them as failed.
      bail: 0,
      coverage: { enabled: false },
      reporters: [createReporter(root, existsSync, onCatalog)],
    },
    {},
    { stdout: createSink(), stderr: createSink() },
  );
  // A project with no stories yet opens on an empty gallery: vitest's own
  // start refuses to run nothing, and its standalone mode waits for a file.
  try {
    if ((await vitest.globTestSpecifications()).length === 0) {
      await vitest.standalone();
      onCatalog(buildCatalog([]));
    } else {
      await vitest.start();
    }
  } catch (error) {
    await vitest.close();
    throw error;
  }
  return {
    accept: async (record) => {
      if (record.golden === undefined || record.text === undefined) {
        throw new Error(
          `${record.title} ${record.name} at ${record.viewportName} has no picture to accept.`,
        );
      }
      mkdirSync(dirname(record.golden), { recursive: true });
      writeFileSync(record.golden, record.text);
      await vitest.runTestFiles([record.file]);
    },
    close: () => vitest.close(),
  };
}
