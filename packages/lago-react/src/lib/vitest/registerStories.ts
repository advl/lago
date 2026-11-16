import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { listStories, type StoriesModule } from "../story/index.js";
import checkOrphans from "./checkOrphans.js";
import checkStory from "./checkStory.js";
import { goldenFolder, storiesFile } from "./constants.js";
import readPreview from "./readPreview.js";
import resolveViewports from "./resolveViewports.js";
import type { Registration } from "./types.js";

/**
 * Makes a stories file a test file: one test per story and viewport, and one
 * that the folder of goldens holds none that no story owns. The plugin
 * appends a call of this to every stories file.
 *
 * A stories file that a test imports is that test's fixture, and adds no test
 * there: only the file vitest is running registers anything.
 *
 * With the project's preview module, every story is set inside its default
 * export.
 *
 * @note Impure: registers tests on the running file.
 */
export default function registerStories(
  module: StoriesModule,
  url: string,
  { viewports, comments, preview: previewPath }: Registration,
  preview?: { readonly default?: unknown },
): void {
  const file = fileURLToPath(url);
  if (expect.getState().testPath !== file) return;
  const order = Object.keys(comments);
  const stories = listStories(
    module,
    file,
    readPreview(preview, previewPath),
  ).sort((one, other) => order.indexOf(one.name) - order.indexOf(other.name));
  const folder = join(dirname(file), goldenFolder);
  const base = basename(file).replace(storiesFile, "");
  const owned = new Set<string>();
  describe(module.default.title, () => {
    for (const story of stories) {
      const sizes = resolveViewports(
        viewports,
        story.parameters.viewports,
        `${story.title} ${story.name}`,
      );
      for (const [viewportName, viewport] of Object.entries(sizes)) {
        const golden = join(
          folder,
          `${base}.${story.name}.${viewportName}.golden`,
        );
        // A story left out of the run still owns its goldens: it is set
        // aside, not removed.
        owned.add(golden);
        if (!story.tags.includes("test")) continue;
        it(`${story.name} at ${viewportName}`, ({ task }) =>
          checkStory(
            {
              file,
              story,
              comment: comments[story.name],
              viewportName,
              viewport,
              golden,
            },
            task,
          ));
      }
    }
    it("keeps no golden that no story owns", () =>
      checkOrphans({ file, folder, base, owned }));
  });
}
