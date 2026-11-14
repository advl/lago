import { type CapturedFrame, type RGBA, TextAttributes } from "@opentui/core";
import {
  type Attribute,
  attributeNames,
  type Color,
  normalizeRuns,
  type Screenshot,
} from "../screenshot/index.js";

const attributeBits: Readonly<Record<Attribute, number>> = {
  blink: TextAttributes.BLINK,
  bold: TextAttributes.BOLD,
  dim: TextAttributes.DIM,
  hidden: TextAttributes.HIDDEN,
  inverse: TextAttributes.INVERSE,
  italic: TextAttributes.ITALIC,
  strikethrough: TextAttributes.STRIKETHROUGH,
  underline: TextAttributes.UNDERLINE,
};

/**
 * A colour as it was asked for. The renderer keeps the asking beside the
 * colour it resolved to: a palette entry stays its number and the terminal's
 * own colour stays the default. A cell nothing painted is transparent, which
 * a terminal shows as its own colour too.
 */
function readColor(color: RGBA): Color {
  const [red, green, blue, alpha] = color.toInts();
  if (color.intent === "default" || alpha === 0) return "default";
  if (color.intent === "indexed") return color.slot;
  return `#${[red, green, blue]
    .map((part) => part.toString(16).padStart(2, "0"))
    .join("")}`;
}

/** The renderer's frame as a screenshot: its spans as runs, as a reader sees them. */
export default function captureScreenshot(frame: CapturedFrame): Screenshot {
  return {
    cols: frame.cols,
    rows: frame.rows,
    lines: frame.lines.map(({ spans }) => {
      let column = 0;
      return normalizeRuns(
        spans.map((span) => {
          const x = column;
          column += span.width;
          return {
            x,
            text: span.text,
            width: span.width,
            fg: readColor(span.fg),
            bg: readColor(span.bg),
            attributes: attributeNames.filter(
              (name) => (span.attributes & attributeBits[name]) !== 0,
            ),
          };
        }),
      );
    }),
  };
}
