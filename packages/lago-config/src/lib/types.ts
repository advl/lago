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
  /** How the gallery, `lago`, looks when it opens on the project. */
  readonly gallery?: GalleryOptions;
}

/**
 * A chrome the gallery has built in: `terminal`, the terminal's own colours
 * and the default, or `light` or `dark`, which fix every colour.
 */
export type ChromeName = "terminal" | "light" | "dark";

/** What `createConfig` is given for the gallery. */
export interface GalleryOptions {
  /**
   * The gallery's own look: a built-in chrome by its name, or a set of
   * `@aztlan/tui`'s tokens holding every one of them, as
   * `{ ...tokens, "color.text": RGBA.fromHex("#202020") }`. The gallery
   * refuses one it cannot read. It never changes a story's picture.
   */
  readonly chrome?: ChromeName | { readonly [token: string]: unknown };
}
