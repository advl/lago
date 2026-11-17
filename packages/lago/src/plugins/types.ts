import type { Tokens } from "@aztlan/tui";
import type { ReactNode } from "react";

/**
 * A plugin's gallery part: the default export of the module its
 * `definePlugin` names as `gallery.module`. The gallery calls it once, when
 * it opens, with the options the project gave the plugin, and takes what it
 * gives.
 */
export type GalleryPart<Options = unknown> = (
  options: Options,
) => GalleryContributions | Promise<GalleryContributions>;

/** What a plugin adds to the gallery. Each part is optional. */
export interface GalleryContributions {
  /**
   * Palettes the pictures can be shown under, by name: each a table of 16
   * or 256 colours, as `#rrggbb`, which a picture's palette entries are
   * shown in. `terminal`, the terminal's own, is the gallery's and always
   * the first.
   */
  readonly palettes?: Readonly<Record<string, readonly string[]>>;
  /**
   * The palette the gallery opens on, one of the plugin's or `terminal`.
   * Without one it opens on `terminal`. One plugin alone may say.
   */
  readonly palette?: string;
  /**
   * Chromes a project's `gallery.chrome` may name, by name: each a full set
   * of `@aztlan/tui`'s tokens.
   */
  readonly chromes?: Readonly<Record<string, Tokens>>;
  /** Keys the gallery binds while nothing is typed or asked. */
  readonly keys?: readonly PluginKey[];
  /** What the plugin shows at the end of the status line, in its order. */
  readonly status?: readonly StatusItem[];
}

/** A key a plugin binds, and what it does to the gallery. */
export interface PluginKey {
  /** As the keymap writes one, as `g` or `ctrl+g`; none the gallery binds itself. */
  readonly key: string;
  /** What it does, in a few words, for the key bar and the help. */
  readonly description: string;
  readonly run: (gallery: GalleryControl) => void;
}

/** What a plugin's key may read of the gallery and do to it. */
export interface GalleryControl {
  readonly selection: PluginSelection;
  /** Every palette's name, `terminal` first. */
  readonly palettes: readonly string[];
  /** Chooses the named palette, for the session alone. */
  readonly setPalette: (name: string) => void;
  /** Shows a message in the status line until the next key. */
  readonly say: (message: string) => void;
}

/** What the reader has selected, as a plugin is shown it. */
export interface PluginSelection {
  /** The selected component's title. */
  readonly title: string | undefined;
  /** The selected story's name, once the stories are open. */
  readonly story: string | undefined;
  /** The viewport shown, by name. */
  readonly viewportName: string | undefined;
  /** The mode shown, by name; none for the base. */
  readonly mode: string | undefined;
  /** The palette chosen. */
  readonly palette: string;
}

/**
 * One item of the status line: a text the gallery fits to its room, or a
 * component the gallery draws in the columns it asks for.
 */
export type StatusItem =
  | { readonly text: (selection: PluginSelection) => string }
  | {
      readonly columns: number;
      readonly component: (props: {
        readonly selection: PluginSelection;
      }) => ReactNode;
    };

/** A palette the gallery offers: none of its own colours for `terminal`. */
export interface Palette {
  readonly name: string;
  readonly colours: readonly string[] | undefined;
}

/** What every plugin of a project adds to the gallery, read and checked. */
export interface Contributions {
  /** `terminal` first, then each plugin's, in their order. */
  readonly palettes: readonly Palette[];
  /** The palette the gallery opens on. */
  readonly palette: string;
  /** The plugins' chromes, by name, each with the plugin that gives it. */
  readonly chromes: Readonly<
    Record<string, { readonly plugin: string; readonly tokens: unknown }>
  >;
  readonly keys: readonly (PluginKey & { readonly plugin: string })[];
  readonly status: readonly StatusItem[];
}
