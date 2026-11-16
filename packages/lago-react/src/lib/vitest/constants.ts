import type { Renderer } from "./types.js";

/** A stories file, by its name. */
export const storiesFile = /\.stories\.[jt]sx?$/;

/** The folder beside a stories file that holds its goldens. */
export const goldenFolder = "__goldens__";

/** What a viewport may be named, since the name is part of a file's name. */
export const viewportName = /^[A-Za-z0-9_-]+$/;

/**
 * The renderer this package draws with, as a vitest configuration needs it.
 * The renderer ships one build for Bun and one for Node, and Bun loads the
 * Bun build for what vitest leaves to it, so the files vitest reads take it
 * too: an object made by one build is not recognised by the other.
 */
export const renderer: Renderer = {
  jsxImportSource: "@opentui/react",
  sharedPackages: [
    "react",
    "react-reconciler",
    "@opentui/core",
    "@opentui/react",
    "@opentui/keymap",
  ],
  conditions: ["bun"],
};
