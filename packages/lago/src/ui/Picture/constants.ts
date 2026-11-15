import { TextAttributes } from "@opentui/core";

/** The renderer's bit for each attribute a screenshot names. */
export const attributeBits = {
  blink: TextAttributes.BLINK,
  bold: TextAttributes.BOLD,
  dim: TextAttributes.DIM,
  hidden: TextAttributes.HIDDEN,
  inverse: TextAttributes.INVERSE,
  italic: TextAttributes.ITALIC,
  strikethrough: TextAttributes.STRIKETHROUGH,
  underline: TextAttributes.UNDERLINE,
} as const;
