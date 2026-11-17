import { describe, expect, it } from "vitest";
import readPlugins from "./readPlugins.js";

const scheme = { values: ["light", "dark"], default: "light" };

describe("readPlugins", () => {
  it("adds the plugins' modes before the project's, and tells each file what names each plugin", () => {
    const { modes, registrations } = readPlugins(
      [
        {
          name: "schemes",
          preview: "/plugin/preview.js",
          globalTypes: { scheme },
          modes: { dark: { globals: { scheme: "dark" } } },
          gallery: { module: "/plugin/gallery.js", options: { all: true } },
        },
        { name: "grid" },
      ],
      { wide: { globals: { density: "wide" } } },
    );
    expect(modes).toEqual({
      dark: { globals: { scheme: "dark" } },
      wide: { globals: { density: "wide" } },
    });
    expect(Object.keys(modes ?? {})).toEqual(["dark", "wide"]);
    expect(registrations).toEqual([
      {
        name: "schemes",
        preview: "/plugin/preview.js",
        globalTypes: { scheme },
      },
      { name: "grid" },
    ]);
  });

  it("leaves a project without modes without them when no plugin adds one", () => {
    expect(readPlugins([{ name: "grid" }], undefined).modes).toBeUndefined();
    expect(readPlugins([], {}).modes).toEqual({});
  });

  it("refuses a mode two plugins name, or a plugin and the project, naming both", () => {
    const dark = { dark: { globals: { scheme: "dark" } } };
    expect(() =>
      readPlugins(
        [
          { name: "a", modes: dark },
          { name: "b", modes: dark },
        ],
        undefined,
      ),
    ).toThrow(
      "The mode dark is named by both the plugin a and the plugin b. A mode is named once: rename one of them.",
    );
    expect(() => readPlugins([{ name: "a", modes: dark }], dark)).toThrow(
      "The mode dark is named by both the plugin a and the project.",
    );
  });

  it("refuses a global two plugins declare, naming both", () => {
    expect(() =>
      readPlugins(
        [
          { name: "a", globalTypes: { scheme } },
          { name: "b", globalTypes: { scheme } },
        ],
        undefined,
      ),
    ).toThrow(
      "The global scheme is declared by both the plugin a and the plugin b.",
    );
  });

  it("refuses globals a plugin declares that cannot be drawn with, and a plugin given twice", () => {
    expect(() =>
      readPlugins(
        [{ name: "a", globalTypes: { scheme: { values: [], default: "x" } } }],
        undefined,
      ),
    ).toThrow(
      "The plugin a declares the global scheme with no values to take.",
    );
    expect(() =>
      readPlugins([{ name: "a" }, { name: "a" }], undefined),
    ).toThrow(
      "The plugin a is given twice. Give each plugin once, with all its options.",
    );
  });
});
