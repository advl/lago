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
 * golden in `__goldens__` beside the file.
 *
 * It appends one line to each stories file, which hands the file's own
 * exports to the code that registers the tests. Which files are run stays
 * vitest's `include` to say.
 */
export default function testStories({
  viewports = { "80x24": defaultViewport },
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
    configureVitest({ defineCacheKeyGenerator }) {
      // Vitest keeps transformed modules between runs, by their source. What
      // is appended to a stories file depends on this plugin's options too,
      // so they are made part of that file's key.
      defineCacheKeyGenerator(({ id }) =>
        storiesFile.test(readPath(id)) ? JSON.stringify(viewports) : undefined,
      );
    },
    transform(code, id) {
      const path = readPath(id);
      if (!storiesFile.test(path)) return null;
      const registration: Registration = {
        viewports,
        comments: readComments(path, code),
      };
      const appended = [
        `import * as __lagoStories from ${JSON.stringify(path)};`,
        `import __lagoRegisterStories from ${JSON.stringify(runtime)};`,
        `__lagoRegisterStories(__lagoStories, import.meta.url, ${JSON.stringify(registration)});`,
      ];
      return { code: `${code}\n${appended.join("\n")}\n`, map: null };
    },
  };
}
