import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createVitest } from "vitest/node";
import { buildCatalog, type CatalogMode } from "../catalog/index.js";
import { readChrome } from "../chrome/index.js";
import { loadPlugins } from "../plugins/index.js";
import { galleryPlugin, storiesPlugin, storiesProject } from "./constants.js";
import createReporter from "./createReporter.js";
import createSink from "./createSink.js";
import readModes from "./readModes.js";
import type { Engine, EngineOptions } from "./types.js";

/**
 * Starts the project's own vitest from code, on its own configuration,
 * running the stories project alone, in watch mode, and never writing a
 * golden: a run that finds one missing or changed reports it, and only
 * `accept` writes one. Before anything runs, each plugin's gallery part is
 * imported, and what the plugins add reaches `onSettings` with the chrome
 * the configuration names, which may be a plugin's; a part that cannot be
 * loaded, or a chrome that cannot be read, stops the start. Every run's
 * results reach `onCatalog`, with the modes the configuration names, and a
 * project with no stories gives one empty catalog.
 *
 * @note Impure: starts vitest, which watches and reads the project, and writes a golden when one is accepted.
 */
export default async function startEngine({
  root,
  onSettings,
  onCatalog,
}: EngineOptions): Promise<Engine> {
  // Read from the configuration once vitest has resolved it, before any run.
  let modes: readonly CatalogMode[] = [];
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
      reporters: [createReporter(root, existsSync, onCatalog, () => modes)],
    },
    {},
    { stdout: createSink(), stderr: createSink() },
  );
  // A project with no stories yet opens on an empty gallery: vitest's own
  // start refuses to run nothing, and its standalone mode waits for a file.
  try {
    const { plugins, configFile } = vitest.vite.config;
    const gallery = plugins.find(({ name }) => name === galleryPlugin);
    modes = readModes(plugins.find(({ name }) => name === storiesPlugin)?.api);
    // Only a configuration file adds the plugin, so a chrome refused always
    // has a file to name.
    const file = String(configFile);
    const contributions = await loadPlugins(gallery?.api.plugins, file);
    onSettings({
      chrome: readChrome(gallery?.api.chrome, file, contributions.chromes),
      plugins: contributions,
    });
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
          `${record.title} ${record.name} at ${record.viewportName}${record.mode === undefined ? "" : ` in ${record.mode}`} has no picture to accept.`,
        );
      }
      mkdirSync(dirname(record.golden), { recursive: true });
      writeFileSync(record.golden, record.text);
      await vitest.runTestFiles([record.file]);
    },
    close: () => vitest.close(),
  };
}
