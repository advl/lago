import type { Screen } from "@aztlan/lago-react";

/**
 * How the first run of text containing `text` is drawn: its two colours as
 * they were asked for, and whether it is bold or italic.
 */
export default function readLook(screen: Screen, text: string) {
  const { fg, bg, attributes } = screen.getByText(text);
  return {
    fg,
    bg,
    bold: attributes.includes("bold"),
    italic: attributes.includes("italic"),
  };
}
