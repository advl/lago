import type { Modifiers, Viewport } from "./types.js";

/** The size of a screen whose test names none: a terminal's usual one. */
export const defaultViewport: Viewport = { cols: 80, rows: 24 };

/**
 * How many frames a screen may draw while settling. A component that still
 * asks for another frame after this many asks on every frame, and would never
 * settle.
 */
export const frameLimit = 100;

/** The pause between two tries of a check that is waited for, in milliseconds. */
export const tryPause = 10;

/**
 * The keys Testing Library's notation names, each as the renderer's name for
 * it or, where the renderer has none, as what a terminal sends.
 */
export const namedKeys: Readonly<Record<string, string>> = {
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

/**
 * The keys that can be held, each as the renderer names it. A terminal sends
 * Alt as its meta key, and the key a keyboard labels Meta, Command or Windows
 * as super.
 */
export const heldKeys: Readonly<Record<string, keyof Modifiers>> = {
  Control: "ctrl",
  Shift: "shift",
  Alt: "meta",
  Meta: "super",
};

/**
 * The timers stopped while a story is drawn, and those a test fakes: the
 * ones a component can wait on, the clock and the high-resolution clock
 * included, so a picture never depends on when it was drawn. `setImmediate` is left running, because
 * React waits on it to know that an update has been committed.
 */
export const stoppedTimers = [
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "Date",
  "performance",
] as const;
