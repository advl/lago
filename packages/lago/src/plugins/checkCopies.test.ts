import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished } from "vitest";
import checkCopies from "./checkCopies.js";

/**
 * A plugin's folder holding a gallery part and, for each of `copies`, a
 * package of that name of its own, and gives the part's path. Its
 * `node_modules` is there even when empty, since Bun installs what a
 * folder without one imports.
 *
 * @note Impure: writes a temporary folder.
 */
function writePlugin(copies: readonly string[]): string {
  const root = mkdtempSync(join(tmpdir(), "lago-plugin-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "node_modules"));
  for (const name of copies) {
    const folder = join(root, "node_modules", name);
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      join(folder, "package.json"),
      JSON.stringify({ name, main: "index.js" }),
    );
    writeFileSync(join(folder, "index.js"), "export default {};\n");
  }
  writeFileSync(join(root, "gallery.js"), "export default () => ({});\n");
  return join(root, "gallery.js");
}

describe("checkCopies", () => {
  it("takes a part that resolves the gallery's copies, or none of them", () => {
    expect(() =>
      checkCopies(
        "own",
        join(import.meta.dirname, "checkCopies.ts"),
        import.meta.dirname,
      ),
    ).not.toThrow();
    expect(() =>
      checkCopies("bare", writePlugin([]), import.meta.dirname),
    ).not.toThrow();
  });

  it("refuses a part that loads a second copy, naming the plugin, the package and how to make it one", () => {
    const module = writePlugin(["@opentui/core"]);
    expect(() => checkCopies("palettes", module, import.meta.dirname)).toThrow(
      `The gallery part of the plugin palettes, ${module}, loads a second copy of @opentui/core`,
    );
    expect(() =>
      checkCopies("palettes", writePlugin(["react"]), import.meta.dirname),
    ).toThrow(
      "the plugin names react as a peer dependency, never as a dependency, and the project installs one copy that serves both.",
    );
  });
});
