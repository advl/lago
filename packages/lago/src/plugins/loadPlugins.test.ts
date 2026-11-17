import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished } from "vitest";
import { noContributions } from "./constants.js";
import loadPlugins from "./loadPlugins.js";

const file = "/project/vitest.config.ts";

/**
 * Writes a gallery part whose default export gives `source`, an expression
 * that may read `options`, and gives its path. Its folder has a
 * `node_modules` of its own, since Bun installs what a folder without one
 * imports.
 *
 * @note Impure: writes a temporary folder.
 */
function writePart(source: string): string {
  const root = mkdtempSync(join(tmpdir(), "lago-part-"));
  onTestFinished(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, "node_modules"));
  const module = join(root, "gallery.js");
  writeFileSync(module, `export default async (options) => (${source});\n`);
  return module;
}

const sixteen = JSON.stringify(Array.from({ length: 16 }, () => "#102030"));

describe("loadPlugins", () => {
  it("adds nothing for a configuration without gallery parts, nor for a part that gives nothing", async () => {
    expect(await loadPlugins(undefined, file)).toBe(noContributions);
    expect(
      await loadPlugins([{ name: "empty", module: writePart("{}") }], file),
    ).toEqual(noContributions);
  });

  it("calls each part with its options and gives what they add, in the plugins' order", async () => {
    const run = () => {};
    const component = () => null;
    const loaded = await loadPlugins(
      [
        {
          name: "palettes",
          module: writePart(
            `{ palettes: { [options.name]: ${sixteen} }, palette: options.name, chromes: { sepia: { mark: 1 } } }`,
          ),
          options: { name: "dracula" },
        },
        {
          name: "grid",
          module: writePart("{ keys: [options.key], status: options.status }"),
          options: {
            key: { key: "g", description: "show the grid", run },
            status: [{ columns: 4, component }],
          },
        },
        { name: "empty", module: writePart("{}") },
      ],
      file,
    );
    expect(loaded).toEqual({
      palettes: [
        { name: "terminal", colours: undefined },
        { name: "dracula", colours: JSON.parse(sixteen) },
      ],
      palette: "dracula",
      chromes: { sepia: { plugin: "palettes", tokens: { mark: 1 } } },
      keys: [{ key: "g", description: "show the grid", run, plugin: "grid" }],
      status: [{ columns: 4, component }],
    });
  });

  it("refuses parts it cannot read, and a part with no function to call, naming the plugin", async () => {
    await expect(loadPlugins([{ name: "grid" }], file)).rejects.toThrow(
      "/project/vitest.config.ts carries the plugins' gallery parts in a shape the gallery cannot read. Give each plugin to createConfig({ plugins }), made by definePlugin.",
    );
    await expect(loadPlugins({}, file)).rejects.toThrow(
      "in a shape the gallery cannot read",
    );
    const module = writePart("{}");
    writeFileSync(module, "export const palettes = {};\n");
    await expect(loadPlugins([{ name: "grid", module }], file)).rejects.toThrow(
      `The gallery part of the plugin grid, ${module}, has no default export that is a function. Export one, which is given the plugin's options and gives what it adds.`,
    );
  });

  it("refuses a palette, a chrome or a key two plugins give, or a plugin and the gallery, naming both", async () => {
    const twice = (source: string) =>
      loadPlugins(
        [
          { name: "a", module: writePart(source) },
          { name: "b", module: writePart(source) },
        ],
        file,
      );
    await expect(
      twice(`{ palettes: { dracula: ${sixteen} } }`),
    ).rejects.toThrow(
      "The palette dracula is given by both the plugin a and the plugin b. Each is given once: leave it to one of them.",
    );
    await expect(
      twice(`{ palettes: { dracula: ${sixteen} }, palette: "terminal" }`),
    ).rejects.toThrow("The palette dracula is given by both");
    await expect(twice(`{ palette: "terminal" }`)).rejects.toThrow(
      "Both the plugin a and the plugin b say which palette the gallery opens on. One alone may: leave it to one of them.",
    );
    await expect(
      loadPlugins(
        [{ name: "a", module: writePart("{ chromes: { dark: {} } }") }],
        file,
      ),
    ).rejects.toThrow(
      "The chrome dark is given by both the gallery and the plugin a.",
    );
    await expect(
      loadPlugins(
        [
          {
            name: "a",
            module: writePart(
              '{ keys: [{ key: "q", description: "quit", run() {} }] }',
            ),
          },
        ],
        file,
      ),
    ).rejects.toThrow(
      "The key q is given by both the gallery and the plugin a.",
    );
  });
});
