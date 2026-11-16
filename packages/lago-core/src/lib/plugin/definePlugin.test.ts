import { describe, expect, it } from "vitest";
import definePlugin from "./definePlugin.js";

describe("definePlugin", () => {
  it("gives the plugin with every module it names by its absolute path", () => {
    const options = { include: ["dracula"], pick: () => "dracula" };
    const plugin = definePlugin({
      name: "palettes",
      preview: new URL("file:///plugin/dist/preview.js"),
      globalTypes: { scheme: { values: ["light", "dark"], default: "light" } },
      modes: { dark: { globals: { scheme: "dark" } } },
      gallery: { module: "file:///plugin/dist/gallery.js", options },
    });
    expect(plugin).toEqual({
      name: "palettes",
      preview: "/plugin/dist/preview.js",
      globalTypes: { scheme: { values: ["light", "dark"], default: "light" } },
      modes: { dark: { globals: { scheme: "dark" } } },
      gallery: { module: "/plugin/dist/gallery.js", options },
    });
    expect(plugin.gallery?.options).toBe(options);
  });

  it("keeps an absolute path as it is, and leaves out what is not given", () => {
    expect(
      definePlugin({
        name: "relay",
        gallery: { module: "/plugin/gallery.js" },
      }),
    ).toEqual({ name: "relay", gallery: { module: "/plugin/gallery.js" } });
    expect(definePlugin({ name: "grid" })).toEqual({ name: "grid" });
  });

  it("refuses a module named from no place, naming the plugin and the part", () => {
    expect(() =>
      definePlugin({ name: "relay", preview: "./preview.js" }),
    ).toThrow(
      'The plugin relay names its preview "./preview.js", which is neither an absolute path nor a file URL. Name it from the plugin\'s own module, as in new URL("./preview.js", import.meta.url).',
    );
    expect(() =>
      definePlugin({
        name: "relay",
        gallery: { module: new URL("data:text/javascript,") },
      }),
    ).toThrow("The plugin relay names its gallery");
  });

  it("refuses a name that a refusal or a command could not carry", () => {
    expect(() => definePlugin({ name: "my plugin" })).toThrow(
      `A plugin's name "my plugin" cannot be used. Use letters, digits, - and _, as in name: "palettes".`,
    );
    expect(() =>
      definePlugin({ name: undefined as unknown as string }),
    ).toThrow("A plugin's name undefined cannot be used.");
  });
});
