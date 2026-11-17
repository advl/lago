import { describe, expect, it } from "vitest";
import readContributions from "./readContributions.js";

const sixteen = Array.from({ length: 16 }, () => "#102030");

describe("readContributions", () => {
  it("gives what a gallery part gives when every part of it can be used", () => {
    const given = {
      palettes: {
        dracula: sixteen,
        xterm: Array.from({ length: 256 }, () => "#FFFFFF"),
      },
      palette: "dracula",
      chromes: { sepia: { "color.text": "#704214" } },
      keys: [{ key: "g", description: "show the grid", run: () => {} }],
      status: [
        { text: () => "grid on" },
        { columns: 8, component: () => null },
      ],
    };
    expect(readContributions("grid", given)).toBe(given);
    expect(readContributions("grid", {})).toEqual({});
    expect(readContributions("grid", { palette: "terminal" })).toEqual({
      palette: "terminal",
    });
  });

  it("refuses what is not a set of contributions, naming the plugin", () => {
    expect(() => readContributions("grid", undefined)).toThrow(
      "The gallery part of the plugin grid gives no set of contributions: its default export is called with the plugin's options and gives an object, as in { palettes, keys }.",
    );
    expect(() => readContributions("grid", [])).toThrow(
      "gives no set of contributions",
    );
  });

  it("refuses a palette that is not a table of 16 or 256 colours, or that takes the terminal's name", () => {
    expect(() => readContributions("p", { palettes: [] })).toThrow(
      "The gallery part of the plugin p gives palettes that are not named.",
    );
    expect(() =>
      readContributions("p", { palettes: { short: ["#000000"] } }),
    ).toThrow(
      "gives the palette short as something other than a table of 16 or 256 colours, each written #rrggbb.",
    );
    expect(() =>
      readContributions("p", { palettes: { named: sixteen.with(3, "red") } }),
    ).toThrow("gives the palette named as something other than a table");
    expect(() =>
      readContributions("p", { palettes: { terminal: sixteen } }),
    ).toThrow(
      "gives a palette named terminal, which is the terminal's own and the gallery's.",
    );
  });

  it("refuses to open on a palette the plugin does not give", () => {
    expect(() =>
      readContributions("p", {
        palettes: { dracula: sixteen },
        palette: "iceberg",
      }),
    ).toThrow(
      'opens on the palette "iceberg", which is not one of its own: terminal, dracula.',
    );
    expect(() => readContributions("p", { palette: "iceberg" })).toThrow(
      "which is not one of its own: terminal.",
    );
  });

  it("refuses chromes, keys and status items it cannot use", () => {
    expect(() =>
      readContributions("p", { chromes: { sepia: "sepia" } }),
    ).toThrow("gives chromes that are not named sets of tokens.");
    expect(() => readContributions("p", { chromes: [] })).toThrow(
      "gives chromes",
    );
    expect(() =>
      readContributions("p", {
        keys: [{ key: "g", description: "", run() {} }],
      }),
    ).toThrow("gives keys that are not each a key, a description and a run.");
    expect(() => readContributions("p", { keys: {} })).toThrow("gives keys");
    expect(() =>
      readContributions("p", {
        status: [{ columns: 0, component: () => null }],
      }),
    ).toThrow(
      "gives status items that are not each a text, or a component and the whole columns it takes.",
    );
    expect(() => readContributions("p", { status: [3] })).toThrow(
      "gives status items",
    );
    expect(() => readContributions("p", { status: {} })).toThrow(
      "gives status items",
    );
  });
});
