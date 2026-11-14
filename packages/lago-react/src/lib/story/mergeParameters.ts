import type { Parameters } from "./types.js";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype;

/**
 * Parameters merged layer over layer, the file's before the story's. An
 * object is merged into the object before it, key by key; anything else, a
 * list included, replaces what was there.
 */
export default function mergeParameters(
  ...layers: (Parameters | undefined)[]
): Parameters {
  const merged: Record<string, unknown> = {};
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer ?? {})) {
      const before = merged[key];
      merged[key] =
        isPlainObject(before) && isPlainObject(value)
          ? mergeParameters(before, value)
          : value;
    }
  }
  return merged;
}
