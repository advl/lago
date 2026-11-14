import type { FileFailure } from "../catalog/index.js";
import { orphanTest } from "./constants.js";
import type { ReportedError, ReportedTest } from "./types.js";

/**
 * What failed a stories file as a whole, or nothing: an error that kept the
 * file from loading, or else a failed check that its goldens all have a
 * story.
 */
export default function readFailure(
  file: string,
  errors: readonly ReportedError[],
  tests: readonly ReportedTest[],
): FileFailure | undefined {
  const [first] = errors;
  if (first) return { file, message: first.message };
  const orphans = tests.find(
    ({ name, state }) => name === orphanTest && state === "failed",
  );
  const message = orphans?.errors.at(0)?.message;
  return message === undefined ? undefined : { file, message };
}
