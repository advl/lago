import type { Plugin as LagoPlugin } from "@aztlan/lago-core";
import type { Plugin } from "vitest/config";
import type { GalleryOptions } from "./types.js";

/**
 * A plugin that does nothing in a run and carries what the gallery reads
 * under its `api`, where `lago` finds it in the project's resolved
 * configuration when it opens: the gallery's settings, and the gallery
 * part of each plugin that has one, by its name, with its module and the
 * options the project gave.
 */
export default function createGalleryPlugin(
  gallery: GalleryOptions,
  plugins: readonly LagoPlugin[],
): Plugin {
  const parts = plugins.flatMap(({ name, gallery: part }) =>
    part ? [{ name, ...part }] : [],
  );
  return {
    name: "lago:gallery",
    api: parts.length === 0 ? gallery : { ...gallery, plugins: parts },
  };
}
