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
}
