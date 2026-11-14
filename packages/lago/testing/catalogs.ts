import type { Catalog, StoryRecord } from "../src/catalog/index.js";
import { buildCatalog } from "../src/catalog/index.js";
import { keysPicture, tallPicture } from "./pictures.js";
import { drawPicture, makeRecord } from "./records.js";

const atBoth = (
  title: string,
  name: string,
  overrides: Partial<StoryRecord>,
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
