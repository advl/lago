import { describe, expect, it } from "vitest";
import createGalleryPlugin from "./createGalleryPlugin.js";

describe("createGalleryPlugin", () => {
  it("carries the gallery's settings, as given, under its api and nothing else", () => {
    const gallery = { chrome: { "color.text": "own" } };
    const plugin = createGalleryPlugin(gallery, [{ name: "grid" }]);
    expect(plugin).toEqual({ name: "lago:gallery", api: gallery });
    expect(plugin.api).toBe(gallery);
  });

  it("carries each plugin's gallery part by the plugin's name, its options as the project gave them", () => {
    const options = { include: ["dracula"], pick: () => "dracula" };
    const plugin = createGalleryPlugin({ chrome: "dark" }, [
      { name: "grid" },
      { name: "palettes", gallery: { module: "/plugin/gallery.js", options } },
    ]);
    expect(plugin.api).toEqual({
      chrome: "dark",
      plugins: [{ name: "palettes", module: "/plugin/gallery.js", options }],
    });
    expect(plugin.api.plugins.at(0).options).toBe(options);
  });
});
