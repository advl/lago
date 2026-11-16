import type { Preview } from "../story/index.js";

/**
 * The annotations a project's preview module gives as its default export, or
 * nothing when the project has no preview. `path` names the module in the
 * error for one with no default export.
 */
export default function readPreview(
  module: { readonly default?: unknown } | undefined,
  path: string | undefined,
): Preview | undefined {
  if (module === undefined) return undefined;
  if (!(module.default instanceof Object)) {
    throw new Error(
      `The preview ${path} has no default export. Export what every story shares as its default, as in export default { decorators: [withTheme] } satisfies Preview.`,
    );
  }
  return module.default;
}
