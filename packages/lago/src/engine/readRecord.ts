import { relative } from "node:path";
import type { StoryRecord } from "../catalog/index.js";
import type { ReportedError, ReportedTest } from "./types.js";

/**
 * Where an error was thrown, as `path:line:column` from `root`: the first
 * frame in the stories file, or else the first frame of all.
 */
function placeError(
  error: ReportedError,
  file: string,
  root: string,
): string | undefined {
  const frames = error.stacks ?? [];
  const frame = frames.find((each) => each.file === file) ?? frames.at(0);
  return frame && `${relative(root, frame.file)}:${frame.line}:${frame.column}`;
}

/**
 * One story test as the gallery shows it, or nothing for a test that is no
 * story's. A test that passed is `pass`. One that failed before its story
 * was drawn is `error`, with the first error's message and its place. One
 * whose picture was drawn and failed is `new` when its golden does not
 * exist, as `exists` tells, and `changed` otherwise. A story's test in a
 * mode, named `<Story> at <viewport>@<mode>`, is not read: the gallery shows
 * the base pictures.
 */
export default function readRecord(
  test: ReportedTest,
  root: string,
  exists: (path: string) => boolean,
): StoryRecord | undefined {
  const at = test.name.lastIndexOf(" at ");
  if (at < 0 || test.name.includes("@", at)) return undefined;
  const { story } = test;
  const base = {
    file: test.file,
    title: story?.title ?? test.suite,
    name: story?.name ?? test.name.slice(0, at),
    description: story?.description,
    viewportName: story?.viewportName ?? test.name.slice(at + 4),
    golden: story?.golden,
    actual: story?.actual,
    expected: story?.expected,
    text: story?.text,
    error: undefined,
  };
  if (test.state === "passed") return { ...base, status: "pass" };
  if (story === undefined) {
    const [first] = test.errors;
    const place = first && placeError(first, test.file, root);
    const message = first?.message ?? "The story did not finish.";
    return {
      ...base,
      status: "error",
      error: place ? `${message}\n  at ${place}` : message,
    };
  }
  return { ...base, status: exists(story.golden) ? "changed" : "new" };
}
