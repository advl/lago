import type { KeyName } from "../screen/index.js";

/**
 * How a terminal sends each named key with no modifier held, in the form most
 * terminals use: a control character, or an escape sequence. A sequence ends
 * in a letter or a `~`, and a held modifier is written into it as a number
 * before that end.
 */
export const keySequences: Readonly<Record<KeyName, string>> = {
  Enter: "\r",
  Escape: "\x1b",
  Tab: "\t",
  Backspace: "\x7f",
  Delete: "\x1b[3~",
  Insert: "\x1b[2~",
  Home: "\x1b[H",
  End: "\x1b[F",
  PageUp: "\x1b[5~",
  PageDown: "\x1b[6~",
  ArrowUp: "\x1b[A",
  ArrowDown: "\x1b[B",
  ArrowRight: "\x1b[C",
  ArrowLeft: "\x1b[D",
  F1: "\x1bOP",
  F2: "\x1bOQ",
  F3: "\x1bOR",
  F4: "\x1bOS",
  F5: "\x1b[15~",
  F6: "\x1b[17~",
  F7: "\x1b[18~",
  F8: "\x1b[19~",
  F9: "\x1b[20~",
  F10: "\x1b[21~",
  F11: "\x1b[23~",
  F12: "\x1b[24~",
};

/** The marks a terminal puts around pasted text when a program asks for them. */
export const pasteMarks = { start: "\x1b[200~", end: "\x1b[201~" } as const;
