import { chromes as builtInChromes } from "../chrome/index.js";
import checkCopies from "./checkCopies.js";
import { galleryKeys, noContributions, terminalPalette } from "./constants.js";
import readContributions from "./readContributions.js";
import type { Contributions } from "./types.js";

/** A plugin's gallery part as `createConfig` carries it. */
interface Part {
  readonly name: string;
  readonly module: string;
  readonly options?: unknown;
}

/** Whether `value` is a gallery part as `createConfig` carries one. */
const isPart = (value: unknown): value is Part =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Part).name === "string" &&
  typeof (value as Part).module === "string";

/**
 * Imports the gallery part of each plugin the configuration in `file`
 * carries, by its path, after checking that it shares the gallery's one
 * copy of React, the renderer, its keymap and vitest; calls each with the
 * options the project gave; and gives what they add together. A palette, a
 * chrome or a key that two plugins give, or a plugin and the gallery, is
 * refused, naming both, as is a second plugin that says which palette the
 * gallery opens on.
 *
 * @note Impure: reads the file system and imports each plugin's module.
 */
export default async function loadPlugins(
  parts: unknown,
  file: string,
): Promise<Contributions> {
  if (parts === undefined) return noContributions;
  if (!(Array.isArray(parts) && parts.every(isPart))) {
    throw new Error(
      `${file} carries the plugins' gallery parts in a shape the gallery cannot read. Give each plugin to createConfig({ plugins }), made by definePlugin.`,
    );
  }
  const palettes = [...noContributions.palettes];
  const owners: Record<string, string> = {};
  const claim = (kind: string, name: string, plugin: string) => {
    const before = owners[`${kind} ${name}`];
    if (before !== undefined) {
      throw new Error(
        `The ${kind} ${name} is given by both ${before} and the plugin ${plugin}. Each is given once: leave it to one of them.`,
      );
    }
    owners[`${kind} ${name}`] = `the plugin ${plugin}`;
  };
  for (const name of Object.keys(builtInChromes)) {
    owners[`chrome ${name}`] = "the gallery";
  }
  for (const key of galleryKeys) owners[`key ${key}`] = "the gallery";
  let palette: { readonly name: string; readonly plugin: string } | undefined;
  const chromes: Record<string, { plugin: string; tokens: unknown }> = {};
  const keys: Contributions["keys"][number][] = [];
  const status: Contributions["status"][number][] = [];
  for (const { name: plugin, module, options } of parts) {
    checkCopies(plugin, module, import.meta.dirname);
    const { default: part } = (await import(module)) as { default?: unknown };
    if (typeof part !== "function") {
      throw new Error(
        `The gallery part of the plugin ${plugin}, ${module}, has no default export that is a function. Export one, which is given the plugin's options and gives what it adds.`,
      );
    }
    const given = readContributions(plugin, await part(options));
    for (const [name, colours] of Object.entries(given.palettes ?? {})) {
      claim("palette", name, plugin);
      palettes.push({ name, colours });
    }
    if (given.palette !== undefined) {
      if (palette !== undefined) {
        throw new Error(
          `Both the plugin ${palette.plugin} and the plugin ${plugin} say which palette the gallery opens on. One alone may: leave it to one of them.`,
        );
      }
      palette = { name: given.palette, plugin };
    }
    for (const [name, tokens] of Object.entries(given.chromes ?? {})) {
      claim("chrome", name, plugin);
      chromes[name] = { plugin, tokens };
    }
    for (const key of given.keys ?? []) {
      claim("key", key.key, plugin);
      keys.push({ ...key, plugin });
    }
    status.push(...(given.status ?? []));
  }
  return {
    palettes,
    palette: palette?.name ?? terminalPalette,
    chromes,
    keys,
    status,
  };
}
