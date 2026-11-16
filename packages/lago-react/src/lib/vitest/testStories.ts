import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultViewport } from "@aztlan/lago-core";
import type { Plugin } from "vitest/config";
import { storiesFile, viewportName } from "./constants.js";
import readComments from "./readComments.js";
import type { Options, Registration } from "./types.js";

/** The module the appended line calls, which stands beside this one. */
const runtime = fileURLToPath(
  import.meta.url.replace(/testStories(\.[jt]s)$/, "registerStories$1"),
);

/** A module's file, from the id vitest knows it by, which may carry a query. */
const readPath = (id: string) => id.replace(/\?.*$/s, "");

/**
 * A vitest plugin that makes every stories file vitest runs a test file: each
 * story is drawn at each viewport, with time stopped, and compared with its
 * golden in `__goldens__` beside the file. With a preview, every story is set
 * inside the preview's default export.
 *
 * It appends lines to each stories file, which hand the file's own exports,
 * and the preview's, to the code that registers the tests. Which files are
 * run stays vitest's `include` to say.
 */
export default function testStories({
  viewports = { "80x24": defaultViewport },
  preview,
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
  return {
    name: "lago:test-stories",
    enforce: "pre",
    configResolved({ root }) {
      if (preview === undefined || existsSync(resolve(root, preview))) return;
      throw new Error(
        `The preview ${JSON.stringify(preview)} given to testStories is not a file: ${resolve(root, preview)} does not exist. Name the module from the project's root, as in preview: "./src/lago.preview.tsx".`,
      );
    },
    configureVitest({ defineCacheKeyGenerator }) {
      // Vitest keeps transformed modules between runs, by their source. What
      // is appended to a stories file depends on this plugin's options too,
      // so they are made part of that file's key.
      defineCacheKeyGenerator(({ id }) =>
        storiesFile.test(readPath(id))
          ? JSON.stringify({ viewports, preview })
          : undefined,
      );
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
