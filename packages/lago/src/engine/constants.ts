/** The name of the test that checks a file's goldens all have a story. */
export const orphanTest = "keeps no golden that no story owns";

/** The project createConfig gives the stories. */
export const storiesProject = "stories";

/**
 * The plugin a project's configuration carries the gallery's settings in,
 * under its `api`: `createConfig({ gallery })` adds it.
 */
export const galleryPlugin = "lago:gallery";
