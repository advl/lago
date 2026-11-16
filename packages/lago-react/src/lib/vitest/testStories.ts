import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultViewport } from "@aztlan/lago-core";
import type { Plugin } from "vitest/config";
import addMatrixReporter from "./addMatrixReporter.js";
import checkMatrix from "./checkMatrix.js";
import { modeName, storiesFile, viewportName } from "./constants.js";
import readComments from "./readComments.js";
import type { Mode, Options, Registration } from "./types.js";

/** The module the appended line calls, which stands beside this one. */
const runtime = fileURLToPath(
  import.meta.url.replace(/testStories(\.[jt]s)$/, "registerStories$1"),
);

/**
 * Refuses a mode whose name cannot be part of a file's name, that sets no
 * global, since drawn with nothing set it would be the base, or whose
 * expected tags are not a list of text.
 */
function checkModes(modes: Readonly<Record<string, Mode>>): void {
  for (const [name, mode] of Object.entries(modes)) {
    if (!modeName.test(name)) {
      throw new Error(
        `The mode name ${JSON.stringify(name)} cannot be part of a file's name. Use letters, digits, - and _.`,
      );
    }
    const globals: unknown = mode?.globals;
    if (
      typeof globals !== "object" ||
      globals === null ||
      Object.keys(globals).length === 0
    ) {
      throw new Error(
        `The mode ${name} sets no global, so it would draw every story as the base does. Give it the globals it sets, as in ${name}: { globals: { scheme: "dark" } }.`,
      );
    }
    // A tag is matched by `includes`, which a lone text would answer for
    // any part of itself.
    const tags: unknown = mode.expect?.tags;
    if (
      mode.expect !== undefined &&
      !(Array.isArray(tags) && tags.every((tag) => typeof tag === "string"))
    ) {
      throw new Error(
        `The mode ${name} expects to change stories by tags that are not a list of text. Name the tags, as in ${name}: { globals: { scheme: "dark" }, expect: { tags: ["coloured"] } }.`,
      );
    }
  }
}

/** A module's file, from the id vitest knows it by, which may carry a query. */
const readPath = (id: string) => id.replace(/\?.*$/s, "");

/**
 * A vitest plugin that makes every stories file vitest runs a test file: each
 * story is drawn at each viewport, with time stopped, and compared with its
 * golden in `__goldens__` beside the file. With a preview, every story is set
 * inside the preview's default export. With modes, every story is drawn in
 * each too, and a mode's picture keeps a golden only where it differs from
 * the base picture at the same viewport, and the matrix totals are printed
 * after the run.
 *
 * It appends lines to each stories file, which hand the file's own exports,
 * and the preview's, to the code that registers the tests. Which files are
 * run stays vitest's `include` to say. Its `api` names the modes, in the
 * order given, for whatever reads the resolved configuration, as the gallery
 * does.
 */
export default function testStories({
  viewports = { "80x24": defaultViewport },
  preview,
  modes,
  matrix,
}: Options = {}): Plugin {
  const names = Object.keys(viewports);
  const unusable = names.find((name) => !viewportName.test(name));
  if (names.length === 0 || unusable !== undefined) {
    throw new Error(
      unusable === undefined
        ? "testStories was given an empty set of viewports. Give at least one, as in viewports: { narrow: { cols: 40, rows: 36 } }, or none for 80 by 24."
        : `The viewport name ${JSON.stringify(unusable)} cannot be part of a file's name. Use letters, digits, - and _.`,
    );
  }
  if (modes !== undefined) checkModes(modes);
  const modeCount = Object.keys(modes ?? {}).length;
  const max: unknown = matrix?.max;
  if (matrix !== undefined && !(Number.isInteger(max) && Number(max) > 0)) {
    throw new Error(
      `matrix.max must be a whole number above 0, the most cells the matrix may hold, as in matrix: { max: 400 }; it is ${JSON.stringify(max)}.`,
    );
  }
  return {
    name: "lago:test-stories",
    enforce: "pre",
    api: { modes: modes ?? {} },
    configResolved({ root }) {
      if (preview === undefined || existsSync(resolve(root, preview))) return;
      throw new Error(
        `The preview ${JSON.stringify(preview)} given to testStories is not a file: ${resolve(root, preview)} does not exist. Name the module from the project's root, as in preview: "./src/lago.preview.tsx".`,
      );
    },
    async configureVitest({ vitest, project, defineCacheKeyGenerator }) {
      // The totals are printed only for a project that draws modes.
      if (modeCount > 0) {
        addMatrixReporter(vitest, project.name);
      }
      // Vitest keeps transformed modules between runs, by their source. What
      // is appended to a stories file depends on this plugin's options too,
      // so they are made part of that file's key.
      defineCacheKeyGenerator(({ id }) =>
        storiesFile.test(readPath(id))
          ? JSON.stringify({ viewports, preview, modes })
          : undefined,
      );
      if (matrix !== undefined) {
        await checkMatrix(project, {
          viewports: names.length,
          modes: modeCount,
          max: matrix.max,
        });
      }
    },
    transform(code, id) {
      const path = readPath(id);
      if (!storiesFile.test(path)) return null;
      const previewPath =
        preview === undefined
          ? undefined
          : resolve(this.environment.config.root, preview);
      const registration: Registration = {
        viewports,
        comments: readComments(path, code),
        ...(previewPath !== undefined && { preview: previewPath }),
        ...(modes !== undefined && { modes }),
      };
      const appended = [
        `import * as __lagoStories from ${JSON.stringify(path)};`,
        `import __lagoRegisterStories from ${JSON.stringify(runtime)};`,
        ...(previewPath === undefined
          ? []
          : [`import * as __lagoPreview from ${JSON.stringify(previewPath)};`]),
        `__lagoRegisterStories(__lagoStories, import.meta.url, ${JSON.stringify(registration)}${previewPath === undefined ? "" : ", __lagoPreview"});`,
      ];
      return { code: `${code}\n${appended.join("\n")}\n`, map: null };
    },
  };
}
