import { relative } from "node:path";
import type { Comparison, StoryRecord } from "../catalog/index.js";
import { timedOut } from "./constants.js";
import type { ReportedError, ReportedTest } from "./types.js";

/**
 * Where an error was thrown, as `path:line:column` from `root`: the first
 * frame in the stories file, or else, when `anywhere`, the first frame of
 * all.
 */
function placeError(
  error: ReportedError,
  file: string,
  root: string,
  anywhere: boolean,
): string | undefined {
  const frames = error.stacks ?? [];
  const frame =
    frames.find((each) => each.file === file) ??
    (anywhere ? frames.at(0) : undefined);
  return frame && `${relative(root, frame.file)}:${frame.line}:${frame.column}`;
}

/**
 * Every error of a failed test, each with its place, a blank line between
 * them: anywhere it was thrown, or, unless `anywhere`, only in the stories
 * file. A timeout says only that the time ran out, so it comes after an
 * error that says why, as the one a story's stalled loaders leave.
 */
function describeErrors(
  errors: readonly ReportedError[],
  file: string,
  root: string,
  anywhere: boolean,
): string | undefined {
  if (errors.length === 0) return undefined;
  const ordered = [
    ...errors.filter(({ message }) => !timedOut.test(message)),
    ...errors.filter(({ message }) => timedOut.test(message)),
  ];
  return ordered
    .map((error) => {
      const place = placeError(error, file, root, anywhere);
      return place ? `${error.message}\n  at ${place}` : error.message;
    })
    .join("\n\n");
}

/** How a mode's picture came out against the base's, as the gallery names it. */
function readComparison({
  comparison,
}: NonNullable<ReportedTest["story"]>): Comparison | undefined {
  if (comparison === undefined) return undefined;
  if (!comparison.equal) return "distinct";
  return comparison.expectedToDiffer ? "unreached" : "equal";
}

/**
 * One story test as the gallery shows it, or nothing for a test that is no
 * story's: `<Story> at <viewport>`, or `<Story> at <viewport>@<mode>` in a
 * mode, which a test that failed before its story was drawn is read by. A
 * test that passed is `pass`. One that failed before its story was drawn is
 * `error`, with every error's message and its place, and so is a mode's
 * picture equal to the base's that failed, as one the mode expected to
 * change does, which keeps no picture of its own. One whose picture was
 * drawn and failed is `new` when its golden does not exist, as `exists`
 * tells, and `changed` otherwise.
 */
export default function readRecord(
  test: ReportedTest,
  root: string,
  exists: (path: string) => boolean,
): StoryRecord | undefined {
  const at = test.name.lastIndexOf(" at ");
  if (at < 0) return undefined;
  const cell = test.name.slice(at + 4);
  const sign = cell.indexOf("@");
  const viewportName = sign < 0 ? cell : cell.slice(0, sign);
  const mode = sign < 0 ? undefined : cell.slice(sign + 1);
  const { story } = test;
  const base = {
    file: test.file,
    title: story?.title ?? test.suite,
    name: story?.name ?? test.name.slice(0, at),
    description: story?.description,
    viewportName: story?.viewportName ?? viewportName,
    mode: story === undefined ? mode : story.mode,
    comparison: story && readComparison(story),
    globals: story?.globals,
    golden: story?.golden,
    actual: story?.actual,
    expected: story?.expected,
    text: story?.text,
    error: undefined,
  };
  if (test.state === "passed") return { ...base, status: "pass" };
  if (story === undefined || story.comparison?.equal === true) {
    // An equal picture draws what the base does, so what it failed with is
    // all there is to show of it. Its failure is Lago's own verdict, whose
    // place inside Lago tells the reader nothing.
    return {
      ...base,
      ...(story !== undefined && {
        actual: undefined,
        expected: undefined,
        text: undefined,
      }),
      status: "error",
      error:
        describeErrors(test.errors, test.file, root, story === undefined) ??
        "The story did not finish.",
    };
  }
  return { ...base, status: exists(story.golden) ? "changed" : "new" };
}
