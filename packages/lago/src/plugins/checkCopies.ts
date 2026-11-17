import { realpathSync } from "node:fs";
import { dirname } from "node:path";
import { sharedPackages } from "./constants.js";

/** The file `specifier` resolves to from `directory`, links followed, or nothing when it does not resolve. */
function resolveFrom(specifier: string, directory: string): string | undefined {
  try {
    return realpathSync(Bun.resolveSync(specifier, directory));
  } catch {
    return undefined;
  }
}

/**
 * Refuses a plugin's gallery part that would load its own copy of React,
 * the renderer, its keymap or vitest, beside the gallery's: each package is
 * resolved from the part's folder as its imports would be, and compared,
 * by its file, with the one the gallery resolves from `gallery`'s. A
 * package the part cannot resolve is one it does not import.
 *
 * @note Impure: reads the file system.
 */
export default function checkCopies(
  plugin: string,
  module: string,
  gallery: string,
): void {
  for (const name of sharedPackages) {
    const theirs = resolveFrom(name, dirname(module));
    const ours = resolveFrom(name, gallery);
    if (theirs === undefined || theirs === ours) continue;
    throw new Error(
      `The gallery part of the plugin ${plugin}, ${module}, loads a second copy of ${name}, ${theirs}, beside the gallery's, ${ours}. Two copies cannot share components, hooks or the objects they make: the plugin names ${name} as a peer dependency, never as a dependency, and the project installs one copy that serves both.`,
    );
  }
}
