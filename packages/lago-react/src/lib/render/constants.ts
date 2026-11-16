import type { KeyName } from "@aztlan/lago-core";

/**
 * How many frames a screen may draw while settling. A component that still
 * asks for another frame after this many asks on every frame, and would never
 * settle.
 */
export const frameLimit = 100;

/**
 * Each key Testing Library's notation names, as the renderer names it or,
 * where the renderer has none, as what a terminal sends.
 */
export const rendererKeys: Readonly<Record<KeyName, string>> = {
  Enter: "RETURN",
  Escape: "ESCAPE",
  Tab: "TAB",
  Backspace: "BACKSPACE",
  Delete: "DELETE",
  Insert: "\x1b[2~",
  Home: "HOME",
  End: "END",
  PageUp: "\x1b[5~",
  PageDown: "\x1b[6~",
  ArrowUp: "ARROW_UP",
  ArrowDown: "ARROW_DOWN",
  ArrowLeft: "ARROW_LEFT",
  ArrowRight: "ARROW_RIGHT",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",
};
