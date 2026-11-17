import type { Catalog, StoryRecord } from "../src/catalog/index.js";
import { buildCatalog } from "../src/catalog/index.js";
import { keysPicture, tallPicture } from "./pictures.js";
import { drawPicture, makeRecord } from "./records.js";

const atBoth = (
  title: string,
  name: string,
  overrides: Partial<StoryRecord> & { lines?: string[] },
): StoryRecord[] => [
  makeRecord(title, name, { viewportName: "terminal", ...overrides }),
  makeRecord(title, name, { viewportName: "wide", ...overrides }),
];

/**
 * A project's catalog: two groups, a picture with every status, two
 * viewports, a story drawn at one of them alone, a picture taller than the
 * list shows, and a stories file that failed to load.
 */
export const sampleCatalog: Catalog = buildCatalog(
  [
    ...atBoth("component/KeyBar", "Default", {
      description: "The keys that work now, each with its hint.",
      actual: keysPicture,
      expected: keysPicture,
    }),
    ...atBoth("component/KeyBar", "Long", {
      status: "changed",
      actual: drawPicture(
        ["↑↓ move  ←→ mode  / find  ? help", "a longer bar"],
        40,
      ),
      expected: drawPicture(
        ["↑↓ move  ←→ mode  / find  ? help", "a long bar"],
        40,
      ),
    }),
    makeRecord("component/Notice", "Missing", {
      viewportName: "terminal",
      status: "new",
      actual: drawPicture(["✗ git is not installed", "Recovery: install git"]),
      expected: undefined,
    }),
    makeRecord("component/Notice", "Thrown", {
      viewportName: "terminal",
      status: "error",
      actual: undefined,
      expected: undefined,
      error:
        "TypeError: cannot read properties of undefined\n  at src/Notice.tsx:4:12",
    }),
    ...atBoth("layout/Pane", "Tall", {
      actual: tallPicture,
      expected: tallPicture,
    }),
  ],
  [
    {
      file: "/project/src/Broken.stories.tsx",
      message:
        "Cannot find module './Missing.js'\nImported from the stories file",
    },
  ],
);

/** A catalog of the same project with every picture passing. */
export const passingCatalog: Catalog = buildCatalog(
  atBoth("component/KeyBar", "Default", {
    actual: keysPicture,
    expected: keysPicture,
  }),
);

/** The globals each mode of `modesCatalog` draws with. */
const drawnWith = {
  base: { scheme: "light", glyphs: "unicode" },
  dark: { scheme: "dark", glyphs: "unicode" },
  ascii: { scheme: "light", glyphs: "ascii" },
} as const;

/** A story's pictures at both viewports in one mode, the base when it is none. */
const inMode = (
  title: string,
  name: string,
  mode: "dark" | "ascii" | undefined,
  overrides: Partial<StoryRecord> & { lines?: string[] },
): StoryRecord[] =>
  atBoth(title, name, {
    mode,
    globals: drawnWith[mode ?? "base"],
    ...overrides,
  });

/**
 * A project with two modes, `dark` and `ascii`, whose matrix holds every
 * state a cell takes: passing, changed, new, equal to the base, equal where
 * a change was expected, an error, and a cell its story leaves out.
 */
export const modesCatalog: Catalog = buildCatalog(
  [
    ...inMode("component/Badge", "Default", undefined, {
      description: "A badge in the project's colours.",
      lines: ["● badge"],
    }),
    ...inMode("component/Badge", "Default", "dark", {
      comparison: "distinct",
      lines: ["● dark badge"],
    }),
    ...inMode("component/Badge", "Default", "ascii", {
      comparison: "equal",
      expected: undefined,
      lines: ["● badge"],
    }),
    ...inMode("component/Badge", "Loud", undefined, { lines: ["▲ LOUD"] }),
    ...inMode("component/Badge", "Loud", "dark", {
      comparison: "distinct",
      status: "changed",
      actual: drawPicture(["▲ LOUD in dark"]),
      expected: drawPicture(["▲ LOUD, darker"]),
      text: "▲ LOUD in dark",
    }),
    ...inMode("component/Badge", "Loud", "ascii", {
      comparison: "distinct",
      status: "new",
      expected: undefined,
      lines: ["^ LOUD"],
    }),
    ...inMode("component/Badge", "Quiet", undefined, { lines: ["· quiet"] }),
    ...inMode("component/Badge", "Quiet", "dark", {
      comparison: "unreached",
      status: "error",
      actual: undefined,
      expected: undefined,
      text: undefined,
      error:
        "The mode dark expects to change the stories tagged coloured, but component/Badge Quiet at terminal draws the base picture: scheme dark did not reach the story.",
    }),
    ...inMode("component/Badge", "Thrown", undefined, {
      status: "error",
      actual: undefined,
      expected: undefined,
      text: undefined,
      error: "TypeError: no badge\n  at src/Badge.tsx:3:9",
    }),
    ...inMode("component/Badge", "Thrown", "dark", {
      status: "error",
      actual: undefined,
      expected: undefined,
      text: undefined,
      globals: undefined,
      error: "TypeError: no badge\n  at src/Badge.tsx:3:9",
    }),
    ...inMode("component/Badge", "Thrown", "ascii", {
      status: "error",
      actual: undefined,
      expected: undefined,
      text: undefined,
      globals: undefined,
      error: "TypeError: no badge\n  at src/Badge.tsx:3:9",
    }),
    ...inMode("layout/Card", "Default", undefined, { lines: ["┌ card ┐"] }),
    ...inMode("layout/Card", "Default", "dark", {
      comparison: "equal",
      expected: undefined,
      lines: ["┌ card ┐"],
    }),
    ...inMode("layout/Card", "Default", "ascii", {
      comparison: "distinct",
      lines: ["+ card +"],
    }),
  ],
  [],
  {
    modes: [
      { name: "dark", globals: { scheme: "dark" } },
      { name: "ascii", globals: { glyphs: "ascii" } },
    ],
    excluded: ["terminal", "wide"].map((viewportName) => ({
      title: "component/Badge",
      name: "Quiet",
      viewportName,
      mode: "ascii",
    })),
  },
);

/** The modes of `crowdedCatalog`, some with names longer than a column of the matrix. */
const crowdedModes = [
  "dark",
  "ascii",
  "solarized-light",
  "high-contrast",
  "truecolor",
];

/**
 * A project whose matrix is larger than a terminal: three components of
 * eight stories each, at two viewports, in the base and five modes, whose
 * cells take every state in turn.
 */
export const crowdedCatalog: Catalog = buildCatalog(
  ["component/Badge", "component/Field", "layout/Pane"].flatMap(
    (title, component) =>
      Array.from({ length: 8 }, (_, story) => `Story${story + 1}`).flatMap(
        (name, story) =>
          [undefined, ...crowdedModes].flatMap((mode, place) => {
            const turn = (component + story + place) % 5;
            return atBoth(title, name, {
              mode,
              ...(mode !== undefined && {
                comparison: turn === 1 ? "equal" : "distinct",
              }),
              ...(turn === 2 && { status: "changed" as const }),
              ...(turn === 3 && { status: "new" as const }),
            });
          }),
      ),
  ),
  [],
  {
    modes: crowdedModes.map((name) => ({ name, globals: { scheme: name } })),
  },
);
