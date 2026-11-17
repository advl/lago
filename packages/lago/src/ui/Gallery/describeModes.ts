import type { CatalogGlobal, CatalogMode } from "../../catalog/index.js";

/** A set of globals in words: `scheme dark, glyphs ascii`, or `no global`. */
const writeGlobals = (globals: Readonly<Record<string, string>>) =>
  Object.entries(globals)
    .map(([name, value]) => `${name} ${value}`)
    .join(", ") || "no global";

/**
 * The help's lines under `m`: the base, then each mode with the globals it
 * sets, then each global with the values the stories were drawn at.
 */
export default function describeModes(
  modes: readonly CatalogMode[],
  globals: readonly CatalogGlobal[],
): string[] {
  return [
    `base: sets ${writeGlobals({})}`,
    ...modes.map(
      ({ name, globals: set }) => `${name}: sets ${writeGlobals(set)}`,
    ),
    ...(globals.length === 0
      ? []
      : [
          `globals drawn: ${globals.map(({ name, values }) => `${name} ${values.join(", ")}`).join("; ")}`,
        ]),
  ];
}
