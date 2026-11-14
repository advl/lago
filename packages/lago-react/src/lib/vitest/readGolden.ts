import { existsSync, readFileSync } from "node:fs";
import { parseGolden } from "../golden/index.js";
import type { Screenshot } from "../screenshot/index.js";

/**
 * What a golden file holds, when there is one and it reads as a golden. One
 * that does not read is nothing to compare a picture with, and its story's
 * test fails on the text all the same.
 *
 * @note Impure: reads the file.
 */
export default function readGolden(path: string): Screenshot | undefined {
  if (!existsSync(path)) return undefined;
  try {
    return parseGolden(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}
