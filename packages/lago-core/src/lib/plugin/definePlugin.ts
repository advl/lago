import { isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";
import { pluginName } from "./constants.js";
import type { ModuleLocation, Plugin, PluginDefinition } from "./types.js";

/**
 * The absolute path of a module a plugin names, or a refusal naming the
 * plugin and the part. A relative path is refused: the plugin is read from a
 * project's configuration, where nothing knows what it would be relative to.
 */
function readLocation(
  location: ModuleLocation,
  plugin: string,
  part: string,
): string {
  const text = String(location);
  if (text.startsWith("file:")) return fileURLToPath(text);
  if (!(location instanceof URL) && isAbsolute(text)) return text;
  throw new Error(
    `The plugin ${plugin} names its ${part} ${JSON.stringify(text)}, which is neither an absolute path nor a file URL. Name it from the plugin's own module, as in new URL("./${part}.js", import.meta.url).`,
  );
}

/**
 * A plugin, as a project gives it to `createConfig({ plugins })`: one entry
 * that configures both of its sides. Its story side, a preview module,
 * globals and modes, is set around every story before the project's own
 * preview. Its gallery part is a module `lago` imports when it opens, with
 * the options the project gave. A package exports a function that takes the
 * project's options and gives `definePlugin`'s result.
 */
export default function definePlugin(definition: PluginDefinition): Plugin {
  const { name, preview, globalTypes, modes, gallery } = definition;
  if (typeof name !== "string" || !pluginName.test(name)) {
    throw new Error(
      `A plugin's name ${JSON.stringify(name)} cannot be used. Use letters, digits, - and _, as in name: "palettes".`,
    );
  }
  return {
    name,
    ...(preview !== undefined && {
      preview: readLocation(preview, name, "preview"),
    }),
    ...(globalTypes !== undefined && { globalTypes }),
    ...(modes !== undefined && { modes }),
    ...(gallery !== undefined && {
      gallery: {
        module: readLocation(gallery.module, name, "gallery"),
        ...("options" in gallery && { options: gallery.options }),
      },
    }),
  };
}
