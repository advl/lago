/** What a call of `lago` asks for. */
export type Request =
  | { readonly kind: "open"; readonly root: string }
  | { readonly kind: "help" }
  | { readonly kind: "version" }
  | { readonly kind: "refused"; readonly reason: string };

/** What `lago` reads from and writes to the process it runs in. */
export interface Terminal {
  /** The folder it was called from. */
  readonly cwd: string;
  /** The version of the package. */
  readonly version: string;
  /** Whether standard input and output are a terminal, which the gallery draws on and reads keys from. */
  readonly interactive: boolean;
  /** Writes to standard output. */
  readonly write: (text: string) => void;
  /** Writes to standard error. */
  readonly warn: (text: string) => void;
}
