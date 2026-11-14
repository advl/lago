/** The widest a frame grows to show its story's name. */
export const titleColumns = 24;

/** What the header says of each arrangement. */
export const arrangementWords = {
  auto: "as the room allows",
  rows: "in rows",
  beside: "side by side",
} as const;

/** The line that closes the help. */
export const helpNote =
  "the pictures are drawn by the project's own vitest, which draws a stories file again when it is saved";

/** What a frame says of a story not drawn at the viewport shown. */
export const notDrawn = "not drawn at this viewport";
