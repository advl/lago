import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  checkGlobals,
  listStories,
  mergePreviews,
  type Parameters,
  type PreviewLayer,
  type StoriesModule,
} from "../story/index.js";
import checkMode from "./checkMode.js";
import checkOrphans from "./checkOrphans.js";
import checkStory from "./checkStory.js";
import { goldenFolder, storiesFile } from "./constants.js";
import readPreview from "./readPreview.js";
import resolveViewports from "./resolveViewports.js";
import type { Cell, Registration } from "./types.js";

/** Whether a story's `parameters.modes` leaves the mode out. */
const isLeftOut = (parameters: Parameters, mode: string) => {
  const modes = parameters.modes as
    | Readonly<Record<string, { readonly disable?: unknown }>>
    | undefined;
  return modes?.[mode]?.disable === true;
};

/**
 * Makes a stories file a test file: one test per story and viewport, one more
 * for each mode, and one that the folder of goldens holds none that no story
 * owns. The plugin appends a call of this to every stories file.
 *
 * A stories file that a test imports is that test's fixture, and adds no test
 * there: only the file vitest is running registers anything.
 *
 * With the project's preview module, every story is set inside its default
 * export, and inside each plugin's preview and globals before it, in the
 * plugins' order. A mode's test follows the base's at the same viewport, and
 * compares its picture with the one the base's test drew.
 *
 * @note Impure: registers tests on the running file.
 */
export default function registerStories(
  module: StoriesModule,
  url: string,
  {
    viewports,
    comments,
    preview: previewPath,
    modes = {},
    plugins = [],
  }: Registration,
  preview?: { readonly default?: unknown },
  pluginPreviews: readonly ({ readonly default?: unknown } | undefined)[] = [],
): void {
  const file = fileURLToPath(url);
  if (expect.getState().testPath !== file) return;
  const order = Object.keys(comments);
  const project = readPreview(preview, previewPath);
  const layers: PreviewLayer[] = plugins.flatMap((plugin, place) => {
    const own = readPreview(pluginPreviews.at(place), plugin.preview);
    return [
      {
        where: `the plugin ${plugin.name}`,
        preview: {
          ...(plugin.globalTypes && { globalTypes: plugin.globalTypes }),
        },
      },
      ...(own
        ? [{ where: `the preview ${plugin.preview}`, preview: own }]
        : []),
    ];
  });
  if (project)
    layers.push({ where: `the preview ${previewPath}`, preview: project });
  // A project with no plugins is set inside its preview as it gives it.
  const annotations = plugins.length === 0 ? project : mergePreviews(layers);
  for (const [name, mode] of Object.entries(modes)) {
    checkGlobals(
      annotations?.globalTypes ?? {},
      mode.globals,
      `The mode ${name}`,
    );
  }
  const stories = listStories(module, file, annotations).sort(
    (one, other) => order.indexOf(one.name) - order.indexOf(other.name),
  );
  const folder = join(dirname(file), goldenFolder);
  const base = basename(file).replace(storiesFile, "");
  const owned = new Set<string>();
  // The base pictures drawn in this run, by story and viewport, for the
  // modes' tests that follow to compare with.
  const drawn = new Map<string, string>();
  const excluded: Cell[] = [];
  describe(module.default.title, () => {
    for (const story of stories) {
      const sizes = resolveViewports(
        viewports,
        story.parameters.viewports,
        `${story.title} ${story.name}`,
      );
      for (const [viewportName, viewport] of Object.entries(sizes)) {
        const cell = {
          file,
          story,
          comment: comments[story.name],
          viewportName,
          viewport,
        };
        const key = `${story.name} at ${viewportName}`;
        const golden = join(
          folder,
          `${base}.${story.name}.${viewportName}.golden`,
        );
        // A story left out of the run still owns its goldens: it is set
        // aside, not removed.
        owned.add(golden);
        if (story.tags.includes("test")) {
          it(key, ({ task }) =>
            checkStory(
              { ...cell, golden, onDrawn: (text) => drawn.set(key, text) },
              task,
            ),
          );
        }
        for (const [modeName, mode] of Object.entries(modes)) {
          if (isLeftOut(story.parameters, modeName)) {
            if (story.tags.includes("test")) {
              excluded.push({
                title: story.title,
                name: story.name,
                viewportName,
                mode: modeName,
              });
            }
            continue;
          }
          const modeGolden = join(
            folder,
            `${base}.${story.name}.${viewportName}@${modeName}.golden`,
          );
          // Owned until its test finds the picture equal to the base's.
          owned.add(modeGolden);
          if (!story.tags.includes("test")) continue;
          it(`${key}@${modeName}`, ({ task }) =>
            checkMode(
              {
                ...cell,
                modeName,
                mode,
                golden: modeGolden,
                base: drawn.get(key),
                onEqual: () => owned.delete(modeGolden),
              },
              task,
            ));
        }
      }
    }
    it("keeps no golden that no story owns", ({ task }) => {
      // The cells left out are counted in the matrix with those drawn.
      if (excluded.length > 0) task.meta.lagoExcluded = excluded;
      checkOrphans({ file, folder, base, owned });
    });
  });
}
