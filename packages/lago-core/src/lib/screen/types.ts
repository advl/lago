import type { Run, Screenshot } from "../screenshot/index.js";

/** The size of a screen, in columns and lines. */
export interface Viewport {
  readonly cols: number;
  readonly rows: number;
}

/** The keys held down while another is pressed. */
export interface Modifiers {
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly meta?: boolean;
  readonly super?: boolean;
}

/** A key Testing Library's notation names, as it writes it between braces. */
export type KeyName =
  | "Enter"
  | "Escape"
  | "Tab"
  | "Backspace"
  | "Delete"
  | "Insert"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12";

/**
 * One key press: a character typed, or a named key, which each renderer
 * sends in its own way.
 */
export type Press =
  | {
      readonly named: false;
      readonly key: string;
      readonly modifiers: Modifiers;
    }
  | {
      readonly named: true;
      readonly key: KeyName;
      readonly modifiers: Modifiers;
    };

/** What a person does at the keyboard. Each resolves once the screen has settled. */
export interface UserEvent {
  /**
   * Presses the keys `text` describes in Testing Library's notation: plain
   * characters, a named key as `{Enter}` or `{ArrowDown}`, a modifier held
   * from `{Control>}` to `{/Control}`. `{{` and `[[` are the two brackets
   * themselves. Throws on a key it does not know.
   */
  readonly keyboard: (text: string) => Promise<void>;
  /** Pastes `text` as a terminal does, in one piece between the paste marks. */
  readonly paste: (text: string) => Promise<void>;
}

/** A mounted component and the screen it is drawn on. */
export interface Screen {
  /** The text of each line as the screen shows it now, without the spaces that end it. */
  readonly lines: readonly string[];
  /**
   * The first run that contains `text`. Throws, showing the screen, when no
   * run does.
   */
  readonly getByText: (text: string) => Run;
  /** The same, once such a run appears. */
  readonly findByText: (text: string) => Promise<Run>;
  /**
   * Lets the screen catch up with a change made from outside it, such as a
   * timer a test advanced.
   */
  readonly settle: () => Promise<void>;
  /** Everything the screen shows now: every run of text with its style. */
  readonly screenshot: () => Screenshot;
  /** Unmounts the component and closes the screen. A test's screens are unmounted when it ends. */
  readonly unmount: () => Promise<void>;
  readonly userEvent: UserEvent;
}

/**
 * What a renderer gives `createScreen`: how to read its screen, how to let
 * it catch up, how to send it a key or a paste, and how to close it.
 * `capture` is called only while the screen is mounted, and `close` once.
 * The others can still be called after `close`, by a test that goes on
 * using a screen it unmounted, so a renderer that cannot take them then
 * refuses them itself.
 */
export interface ScreenParts {
  readonly capture: () => Screenshot;
  readonly settle: () => Promise<void>;
  readonly press: (press: Press) => Promise<void>;
  readonly paste: (text: string) => Promise<void>;
  readonly close: () => Promise<void>;
}
