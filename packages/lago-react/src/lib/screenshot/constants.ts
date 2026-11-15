import type { Attribute } from "./types.js";

/** Every attribute, in the order a run lists them. */
export const attributeNames: readonly Attribute[] = [
  "blink",
  "bold",
  "dim",
  "hidden",
  "inverse",
  "italic",
  "strikethrough",
  "underline",
];

/**
 * The attributes that show on a space. Each draws with the text colour where
 * no character is, so a space that carries one is drawn text like any other.
 */
export const attributesSeenOnSpaces: readonly Attribute[] = [
  "inverse",
  "strikethrough",
  "underline",
];
