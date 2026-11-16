import { type Tokens, tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";

/**
 * The chromes the gallery draws itself in, by name. `terminal` is
 * `@aztlan/tui`'s own tokens: the terminal's default text and background,
 * and its palette's entries, so the gallery takes whatever colours, and
 * whatever transparency, the terminal has. `light` and `dark` fix every
 * colour, the background included, so the gallery looks the same in any
 * terminal; each keeps text at 4.5 to 1 against its background and its
 * selected shade, and keeps the glyphs, so a status still reads by its mark
 * and its word.
 */
export const chromes = {
  terminal: tokens,
  light: {
    ...tokens,
    "color.text": RGBA.fromHex("#1c1c1c"),
    "color.text.muted": RGBA.fromHex("#545454"),
    "color.text.error": RGBA.fromHex("#b3261e"),
    "color.text.warning": RGBA.fromHex("#7f4d00"),
    "color.text.success": RGBA.fromHex("#1b6e30"),
    "color.border": RGBA.fromHex("#8a8a8a"),
    "color.background": RGBA.fromHex("#fafafa"),
    "color.background.selected": RGBA.fromHex("#dedede"),
  },
  dark: {
    ...tokens,
    "color.text": RGBA.fromHex("#e4e4e4"),
    "color.text.muted": RGBA.fromHex("#a8a8a8"),
    "color.text.error": RGBA.fromHex("#ff8278"),
    "color.text.warning": RGBA.fromHex("#e0b040"),
    "color.text.success": RGBA.fromHex("#72c476"),
    "color.border": RGBA.fromHex("#7c7c7c"),
    "color.background": RGBA.fromHex("#1b1b1b"),
    "color.background.selected": RGBA.fromHex("#383838"),
  },
} as const satisfies Readonly<Record<string, Tokens>>;
