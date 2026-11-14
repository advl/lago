import type { RGBA } from "@opentui/core";

/**
 * A token's colour as a screenshot gives it back: the terminal's own as
 * `default`, a palette entry as its number.
 */
export default function readColor(color: RGBA) {
  return color.intent === "default" ? "default" : color.slot;
}
