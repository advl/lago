import type { Color, Screenshot } from "@aztlan/lago-react";
import type { Cell } from "../Picture/types.js";

/** A colour as it was asked for, in words. */
const describeColor = (color: Color) => {
  if (color === "default") return "the terminal's own";
  return typeof color === "number" ? `palette ${color}` : color;
};

/**
 * What is drawn at `cell`, in words: its place, counted from 1, the text of
 * the run that covers it, both colours as the story asked for them, and its
 * attributes. A screenshot gives an inverted run with its colours already
 * exchanged, so they are exchanged back.
 */
export default function describeCell(picture: Screenshot, { x, y }: Cell) {
  const place = `column ${x + 1}, line ${y + 1}`;
  const run = (picture.lines.at(y) ?? []).find(
    (each) => each.x <= x && x < each.x + each.width,
  );
  if (!run) return `${place}: nothing drawn`;
  const inverted = run.attributes.includes("inverse");
  const [fg, bg] = inverted ? [run.bg, run.fg] : [run.fg, run.bg];
  const attributes =
    run.attributes.length > 0 ? ` · ${run.attributes.join(", ")}` : "";
  return `${place}: “${run.text}” · fg ${describeColor(fg)} · bg ${describeColor(bg)}${attributes}`;
}
