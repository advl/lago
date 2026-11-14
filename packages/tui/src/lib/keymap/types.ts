/**
 * The keys of one line of the help, and of one hint in the key bar: one
 * command, or neighbouring commands that share a label, such as the two
 * that move between pages.
 */
export interface KeyCommand {
  /** The first key of each command, as shown: `←`, `→`. */
  readonly keys: readonly string[];
  /** The other keys of the same commands: `h`, `l`. */
  readonly alternates: readonly string[];
  /** What the keys do: `switch page`. */
  readonly label: string;
  /**
   * The short label in the key bar, such as `page`: empty for a key shown
   * alone, such as `?`, and absent for a key the bar leaves out.
   */
  readonly hint?: string;
  /** What the keys act on, which groups the help: `Page`, `App`. */
  readonly group: string;
  /** Lines the help shows under the keys. */
  readonly notes: readonly string[];
}

/** Props for the useCommands hook. */
export interface UseCommandsProps {
  /**
   * `active` for the commands the keys run now, as the key bar shows;
   * `registered` for every command bound, as the help lists.
   */
  readonly visibility: "active" | "registered";
}

/** The commands, in the order they were bound. */
export type UseCommandsResult = readonly KeyCommand[];
