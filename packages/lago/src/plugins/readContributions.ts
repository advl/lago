import { paletteColour, paletteSizes, terminalPalette } from "./constants.js";
import type { GalleryContributions, PluginKey, StatusItem } from "./types.js";

/** Whether `value` is an object of named entries. */
const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Whether `value` is text with something in it. */
const isText = (value: unknown): value is string =>
  typeof value === "string" && value !== "";

/** Whether `value` is a key the plugin binds, as a key and a description and a command. */
const isKey = (value: unknown): value is PluginKey =>
  isRecord(value) &&
  isText(value.key) &&
  isText(value.description) &&
  typeof value.run === "function";

/** Whether `value` is an item of the status line: a text, or a component and its columns. */
const isStatusItem = (value: unknown): value is StatusItem =>
  isRecord(value) &&
  (typeof value.text === "function" ||
    (typeof value.component === "function" &&
      Number.isInteger(value.columns) &&
      Number(value.columns) > 0));

/** Whether `value` is a palette's table: 16 or 256 colours, each `#rrggbb`. */
const isPalette = (value: unknown): value is readonly string[] =>
  Array.isArray(value) &&
  paletteSizes.includes(value.length) &&
  value.every(
    (colour) => typeof colour === "string" && paletteColour.test(colour),
  );

/**
 * What a plugin's gallery part gave, checked part by part, or a refusal
 * naming the plugin and what is wrong. `{}` adds nothing.
 */
export default function readContributions(
  plugin: string,
  given: unknown,
): GalleryContributions {
  const refuse = (what: string): never => {
    throw new Error(`The gallery part of the plugin ${plugin} ${what}.`);
  };
  if (!isRecord(given)) {
    return refuse(
      "gives no set of contributions: its default export is called with the plugin's options and gives an object, as in { palettes, keys }",
    );
  }
  const { palettes, palette, chromes, keys, status } = given;
  if (palettes !== undefined) {
    if (!isRecord(palettes)) refuse("gives palettes that are not named");
    for (const [name, table] of Object.entries(palettes as object)) {
      if (name === terminalPalette) {
        refuse(
          `gives a palette named ${terminalPalette}, which is the terminal's own and the gallery's`,
        );
      }
      if (!isPalette(table)) {
        refuse(
          `gives the palette ${name} as something other than a table of 16 or 256 colours, each written #rrggbb`,
        );
      }
    }
  }
  const own = Object.keys(isRecord(palettes) ? palettes : {});
  if (
    palette !== undefined &&
    !(palette === terminalPalette || own.includes(String(palette)))
  ) {
    refuse(
      `opens on the palette ${JSON.stringify(palette)}, which is not one of its own: ${[terminalPalette, ...own].join(", ")}`,
    );
  }
  if (
    chromes !== undefined &&
    !(isRecord(chromes) && Object.values(chromes).every(isRecord))
  ) {
    refuse("gives chromes that are not named sets of tokens");
  }
  if (keys !== undefined && !(Array.isArray(keys) && keys.every(isKey))) {
    refuse("gives keys that are not each a key, a description and a run");
  }
  if (
    status !== undefined &&
    !(Array.isArray(status) && status.every(isStatusItem))
  ) {
    refuse(
      "gives status items that are not each a text, or a component and the whole columns it takes",
    );
  }
  return given as GalleryContributions;
}
