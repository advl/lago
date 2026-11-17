/**
 * One setting of a project's that is not an arg, such as a colour scheme: the
 * values it takes, and the one a story is drawn with unless something fixes
 * another.
 */
export interface GlobalType {
  readonly values: readonly string[];
  /** One of `values`. */
  readonly default: string;
  /** What the setting changes, for whoever reads the project. */
  readonly description?: string;
}

/** The globals a project declares, by name. */
export type GlobalTypes = Readonly<Record<string, GlobalType>>;

/** Values of globals, by the global's name. */
export type Globals = Readonly<Record<string, string>>;

/**
 * A named set of globals every story is drawn in, beside its picture in no
 * mode, the base.
 */
export interface Mode {
  /** Values of globals the project declares; a story's own fixed ones win. */
  readonly globals: Globals;
  /**
   * The stories the mode is meant to change, by tag. One of them whose
   * picture comes out equal to the base fails: the mode did not reach it.
   */
  readonly expect?: { readonly tags: readonly string[] };
}

/**
 * Where a module is: an absolute path, or a `file:` URL, as
 * `new URL("./preview.js", import.meta.url)` gives one from the module that
 * names it.
 */
export type ModuleLocation = string | URL;

/** What a plugin's author gives `definePlugin`. */
export interface PluginDefinition {
  /**
   * What the plugin is called wherever Lago names it, as in a refusal:
   * letters, digits, `-` and `_`, as `palettes` for
   * `@aztlan/lago-plugin-palettes`.
   */
  readonly name: string;
  /**
   * A module whose default export is a preview, as a project's is: what the
   * plugin sets around every story, outside the project's own preview.
   */
  readonly preview?: ModuleLocation;
  /** Globals the plugin declares, each with its values and its default. */
  readonly globalTypes?: GlobalTypes;
  /** Modes the plugin adds to the project's, by name. */
  readonly modes?: Readonly<Record<string, Mode>>;
  /** What the plugin adds to the gallery. */
  readonly gallery?: {
    /**
     * The module the gallery imports, whose default export is given
     * `options` and gives what the plugin adds.
     */
    readonly module: ModuleLocation;
    /** What the project configured the plugin with, as the gallery needs it. */
    readonly options?: unknown;
  };
}

/** A plugin as `definePlugin` gives it: every module it names by its absolute path. */
export interface Plugin {
  readonly name: string;
  readonly preview?: string;
  readonly globalTypes?: GlobalTypes;
  readonly modes?: Readonly<Record<string, Mode>>;
  readonly gallery?: PluginGallery;
}

/** A plugin's gallery part, as the gallery finds it in a project's configuration. */
export interface PluginGallery {
  /** The absolute path of the module the gallery imports. */
  readonly module: string;
  readonly options?: unknown;
}
