import type { IBufferCell } from "@xterm/headless";
import {
  type Attribute,
  attributeNames,
  type Color,
  type Run,
} from "../screenshot/index.js";

const readColor = (
  isDefault: boolean,
  isRgb: boolean,
  value: number,
): Color => {
  if (isDefault) return "default";
  if (isRgb) return `#${value.toString(16).padStart(6, "0")}`;
  return value;
};

const isSet: Readonly<Record<Attribute, (cell: IBufferCell) => number>> = {
  blink: (cell) => cell.isBlink(),
  bold: (cell) => cell.isBold(),
  dim: (cell) => cell.isDim(),
  hidden: (cell) => cell.isInvisible(),
  inverse: (cell) => cell.isInverse(),
  italic: (cell) => cell.isItalic(),
  strikethrough: (cell) => cell.isStrikethrough(),
  underline: (cell) => cell.isUnderline(),
};

/**
 * One cell of the emulator's screen as a run of its own, its colours as they
 * were asked for. An inverted cell has its two colours exchanged, as a
 * renderer that reports cells it has drawn gives them, so that a screen read
 * from bytes and one read from a renderer's own cells agree.
 */
export default function readCell(cell: IBufferCell, x: number): Run {
  const fg = readColor(cell.isFgDefault(), cell.isFgRGB(), cell.getFgColor());
  const bg = readColor(cell.isBgDefault(), cell.isBgRGB(), cell.getBgColor());
  const attributes = attributeNames.filter((name) => isSet[name](cell) !== 0);
  const inverse = attributes.includes("inverse");
  return {
    x,
    text: cell.getChars() || " ",
    width: cell.getWidth(),
    fg: inverse ? bg : fg,
    bg: inverse ? fg : bg,
    attributes,
  };
}
