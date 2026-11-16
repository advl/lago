import type { Plugin } from "vitest/config";
import type { GalleryOptions } from "./types.js";

/**
 * A plugin that does nothing in a run and carries the gallery's settings
 * under its `api`, where `lago` reads them from the project's resolved
 * configuration when it opens.
 */
export default function createGalleryPlugin(gallery: GalleryOptions): Plugin {
  return { name: "lago:gallery", api: gallery };
}
