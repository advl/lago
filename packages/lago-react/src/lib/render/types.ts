import type { Run, Screenshot } from "../screenshot/index.js";

/** The size of a screen, in columns and lines. */
export interface Viewport {
  readonly cols: number;
  readonly rows: number;
}

/** The keys held down while another is pressed, as the renderer names them. */
export interface Modifiers {
  readonly ctrl?: boolean;
  readonly shift?: boolean;
  readonly meta?: boolean;
  readonly super?: boolean;
}

/** One key press: a character, or what a terminal sends for a named key. */
export interface Press {
  readonly key: string;
  readonly modifiers: Modifiers;
}

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
