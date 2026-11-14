import { resolve } from "node:path";
import type { Request } from "./types.js";

/**
 * What the arguments of a call ask for, read strictly: one project folder
 * at most, resolved against `cwd`, or `--help` or `--version` alone. Any
 * other option, or a second folder, is refused with the reason.
 */
export default function readArguments(
  argv: readonly string[],
  cwd: string,
): Request {
  const options = argv.filter((argument) => argument.startsWith("-"));
  const folders = argv.filter((argument) => !argument.startsWith("-"));
  const [option] = options;
  if (option !== undefined) {
    if (argv.length > 1) {
      return { kind: "refused", reason: `${option} takes nothing else` };
    }
    if (option === "-h" || option === "--help") return { kind: "help" };
    if (option === "-v" || option === "--version") return { kind: "version" };
    return { kind: "refused", reason: `unknown option ${option}` };
  }
  if (folders.length > 1) {
    return { kind: "refused", reason: "takes one project folder" };
  }
  return { kind: "open", root: resolve(cwd, folders.at(0) ?? ".") };
}
