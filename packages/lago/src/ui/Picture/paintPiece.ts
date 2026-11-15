import type { Color } from "@aztlan/lago-react";
import { RGBA, TextAttributes } from "@opentui/core";
import { attributeBits } from "./constants.js";
import type { DrawnPiece } from "./types.js";

/** A screenshot's colour as the renderer takes it, the terminal's own for its role. */
const makeColor = (color: Color, role: "fg" | "bg") => {
  if (color === "default") {
    return role === "fg" ? RGBA.defaultForeground() : RGBA.defaultBackground();
  }
  return typeof color === "number"
    ? RGBA.fromIndex(color)
    : RGBA.fromHex(color);
};

/**
 * The colours and attributes a piece is drawn with, so that the renderer
 * reports it as the story drew it. A screenshot gives an inverted run with
 * its colours already exchanged, so they are exchanged back and the
 * renderer exchanges them again; the cursor inverts its cell once more.
 */
export default function paintPiece({ fg, bg, attributes, cursor }: DrawnPiece) {
  const exchanged = attributes.includes("inverse");
  const [asked, under] = exchanged ? [bg, fg] : [fg, bg];
  const bits = attributes
    .filter((attribute) => attribute !== "inverse")
    .reduce<number>((all, attribute) => all | attributeBits[attribute], 0);
  return {
    fg: makeColor(asked, "fg"),
    bg: makeColor(under, "bg"),
    attributes: exchanged === cursor ? bits : bits | TextAttributes.INVERSE,
  };
}
