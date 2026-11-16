import type { Mode } from "@aztlan/lago-react/vitest";

/** What `createConfig` is given. */
export interface Options {
  /**
   * The sizes every story is drawn at, each under a name that becomes part of
   * its golden's file name, as in `{ narrow: { cols: 40, rows: 36 } }`.
   * Without them, a terminal's usual 80 columns and 24 lines.
   */
  readonly viewports?: Readonly<
    Record<string, { readonly cols: number; readonly rows: number }>
  >;
  /**
   * Whether to set up coverage: measured by v8 over `src/`, with a floor of
   * 100%, when a run asks for it with `--coverage --project unit`.
   */
  readonly coverage?: boolean;
  /**
   * The project's preview: a module, named from the project's root, whose
   * default export every story is set inside, as in
   * `"./src/lago.preview.tsx"`. It is story setup, so coverage leaves it out.
   */
  readonly preview?: string;
  /**
   * Modes every story is drawn in as well as the base, each a named set of
   * globals the preview declares, as in
   * `{ dracula: { globals: { scheme: "dracula" } } }`. A mode's picture keeps
   * a golden only where it differs from the base's.
   */
  readonly modes?: Readonly<Record<string, Mode>>;
  /**
   * A bound on the matrix's cells: every story the stories files export, at
   * every viewport, in the base and in each mode.
   */
  readonly matrix?: { readonly max: number };
}
