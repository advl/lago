import type { KeyName, Modifiers, Viewport } from "./types.js";

/** The size of a screen whose test names none: a terminal's usual one. */
export const defaultViewport: Viewport = { cols: 80, rows: 24 };

/** The pause between two tries of a check that is waited for, in milliseconds. */
export const tryPause = 10;

/** Every key Testing Library's notation names, in the order a refusal lists them. */
export const keyNames: readonly KeyName[] = [
  "Enter",
  "Escape",
  "Tab",
  "Backspace",
  "Delete",
  "Insert",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
];

/**
 * The keys that can be held, each as a terminal reports it. A terminal sends
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
 * included, so a picture never depends on when it was drawn. `setImmediate`
 * is left running, because React waits on it to know that an update has been
 * committed.
 */
export const stoppedTimers = [
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "Date",
  "performance",
] as const;
