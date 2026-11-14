import { statSync } from "node:fs";
import { usage } from "./constants.js";
import readArguments from "./readArguments.js";
import type { Terminal } from "./types.js";

/**
 * Runs one call of `lago`: prints the help or the version, refuses what it
 * cannot do with the reason and the usage, or opens the gallery on the
 * project folder through `open`, saying why when it fails. Gives the exit
 * code.
 *
 * @note Impure: writes to the terminal, and reads whether the folder exists.
 */
export default async function runLago(
  argv: readonly string[],
  terminal: Terminal,
  open: (root: string) => Promise<number>,
): Promise<number> {
  const request = readArguments(argv, terminal.cwd);
  switch (request.kind) {
    case "help":
      terminal.write(usage);
      return 0;
    case "version":
      terminal.write(`${terminal.version}\n`);
      return 0;
    case "refused":
      terminal.warn(`lago: ${request.reason}\n\n${usage}`);
      return 2;
    case "open":
      if (!terminal.interactive) {
        terminal.warn("lago: the gallery needs a terminal to draw on\n");
        return 2;
      }
      if (!statSync(request.root, { throwIfNoEntry: false })?.isDirectory()) {
        terminal.warn(`lago: no folder at ${request.root}\n`);
        return 2;
      }
      try {
        return await open(request.root);
      } catch (error) {
        terminal.warn(`lago: ${String(error).replace(/^Error: /, "")}\n`);
        return 1;
      }
  }
}
