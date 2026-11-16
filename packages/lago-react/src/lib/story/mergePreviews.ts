import mergeParameters from "./mergeParameters.js";
import type { GlobalTypes, Preview, PreviewLayer } from "./types.js";

/**
 * One preview made of layers, the first outermost, as the plugins' previews
 * are set before the project's: args and parameters merged in order, so a
 * later layer's win; decorators in order, so a later layer's wrap an earlier
 * one's; loaders run and tags read in order. A global is declared by one
 * layer alone: one that two declare is refused, naming both.
 */
export default function mergePreviews(
  layers: readonly PreviewLayer[],
): Preview {
  const globalTypes: Record<string, GlobalTypes[string]> = {};
  const declarers: Record<string, string> = {};
  for (const { where, preview } of layers) {
    for (const [name, declared] of Object.entries(preview.globalTypes ?? {})) {
      const before = declarers[name];
      if (before !== undefined) {
        throw new Error(
          `The global ${name} is declared by both ${before} and ${where}. A global is declared once: leave it to one of them.`,
        );
      }
      declarers[name] = where;
      globalTypes[name] = declared;
    }
  }
  const previews = layers.map(({ preview }) => preview);
  return {
    args: Object.assign({}, ...previews.map(({ args }) => args)),
    parameters: mergeParameters(
      ...previews.map(({ parameters }) => parameters),
    ),
    decorators: previews.flatMap(({ decorators = [] }) => decorators),
    loaders: previews.flatMap(({ loaders = [] }) => loaders),
    tags: previews.flatMap(({ tags = [] }) => tags),
    globalTypes,
  };
}
