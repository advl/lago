import { describe, expect, it } from "vitest";
import createGalleryPlugin from "./createGalleryPlugin.js";

describe("createGalleryPlugin", () => {
  it("carries the gallery's settings, as given, under its api and nothing else", () => {
    const gallery = { chrome: { "color.text": "own" } };
    const plugin = createGalleryPlugin(gallery);
    expect(plugin).toEqual({ name: "lago:gallery", api: gallery });
    expect(plugin.api).toBe(gallery);
  });
});
