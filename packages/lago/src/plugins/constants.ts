import type { Contributions } from "./types.js";

/**
 * The packages the gallery and every plugin's gallery part must share one
 * copy of: a second React has no component to call hooks from, and an
 * object made by one copy of the renderer, its keymap or vitest is not one
 * the other recognises.
 */
export const sharedPackages = [
  "react",
  "@opentui/core",
  "@opentui/react",
  "@opentui/keymap",
  "vitest",
] as const;

/** The palette that is the terminal's own, which the gallery always offers first. */
export const terminalPalette = "terminal";

/** How many colours a palette's table holds: a terminal's 16, or its 256. */
export const paletteSizes: readonly number[] = [16, 256];

/** What a palette's colour is written as. */
export const paletteColour = /^#[0-9a-f]{6}$/i;

/**
 * Every key the gallery binds itself, which no plugin may take, as the
 * keymap writes them.
 */
export const galleryKeys: readonly string[] = [
  "up",
  "k",
  "down",
  "j",
  "left",
  "h",
  "right",
  "l",
  "return",
  "escape",
  "/",
  "n",
  "shift+n",
  "backspace",
  "p",
  "m",
  "x",
  "v",
  "d",
  "c",
  "shift+a",
  "y",
  "t",
  "?",
  "q",
];

/** What a project with no plugin adds to the gallery: the terminal's palette alone. */
export const noContributions: Contributions = {
  palettes: [{ name: terminalPalette, colours: undefined }],
  palette: terminalPalette,
  chromes: {},
  keys: [],
  status: [],
};
