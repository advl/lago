import type { Mode, Plugin } from "@aztlan/lago-core";
import { checkGlobalTypes, mergePreviews } from "../story/index.js";
import type { PluginRegistration } from "./types.js";

/** What the plugins add to a project's stories, read once, when the plugin is made. */
interface ReadPlugins {
  /** The project's modes and the plugins', or none when neither has any. */
  readonly modes: Readonly<Record<string, Mode>> | undefined;
  /** What each stories file is told of each plugin, in their order. */
  readonly registrations: readonly PluginRegistration[];
}

/**
 * The plugins, checked against each other and against the project's
 * modes: a plugin given twice, globals a plugin declares that cannot be
 * drawn with, or a global or a mode that two of them declare, or one of
 * them and the project, are refused, naming both. A global one of them
 * declares and the project's preview declares too is refused only once the
 * preview is read, beside the stories.
 */
export default function readPlugins(
  plugins: readonly Plugin[],
  projectModes: Readonly<Record<string, Mode>> | undefined,
): ReadPlugins {
  const named = new Set<string>();
  for (const { name, globalTypes } of plugins) {
    if (named.has(name)) {
      throw new Error(
        `The plugin ${name} is given twice. Give each plugin once, with all its options.`,
      );
    }
    named.add(name);
    checkGlobalTypes(globalTypes, `The plugin ${name}`);
  }
  mergePreviews(
    plugins.map(({ name, globalTypes }) => ({
      where: `the plugin ${name}`,
      preview: { ...(globalTypes && { globalTypes }) },
    })),
  );
  const modes: Record<string, Mode> = {};
  const namers: Record<string, string> = {};
  const sources = [
    ...plugins.map(({ name, modes }) => [`the plugin ${name}`, modes] as const),
    ["the project", projectModes] as const,
  ];
  for (const [where, given] of sources) {
    for (const [name, mode] of Object.entries(given ?? {})) {
      const before = namers[name];
      if (before !== undefined) {
        throw new Error(
          `The mode ${name} is named by both ${before} and ${where}. A mode is named once: rename one of them.`,
        );
      }
      namers[name] = where;
      modes[name] = mode;
    }
  }
  return {
    modes:
      projectModes === undefined && Object.keys(modes).length === 0
        ? undefined
        : modes,
    registrations: plugins.map(({ name, preview, globalTypes }) => ({
      name,
      ...(preview !== undefined && { preview }),
      ...(globalTypes !== undefined && { globalTypes }),
    })),
  };
}
