import type { Viewport } from "@aztlan/lago-core";
import { formatGolden } from "@aztlan/lago-core";
import { expect, type TestContext, vi } from "vitest";
import {
  type Globals,
  type PreparedStory,
  readDescription,
  resolveGlobals,
  runStory,
} from "../story/index.js";
import readGolden from "./readGolden.js";
import type { Mode } from "./types.js";

interface Subject {
  readonly file: string;
  readonly story: PreparedStory;
  readonly comment: string | undefined;
  readonly viewportName: string;
  readonly viewport: Viewport;
  readonly modeName: string;
  readonly mode: Mode;
  /** Where the mode's golden is kept, when its picture differs. */
  readonly golden: string;
  /**
   * The base picture at the same viewport, as a golden's text, when the
   * base's test drew it earlier in the run.
   */
  readonly base: string | undefined;
  /** Told when the picture is equal to the base's, and keeps no golden. */
  readonly onEqual: () => void;
}

/** The globals a mode sets, as a sentence names them. */
const writeGlobals = (globals: Globals) =>
  Object.entries(globals)
    .map(([name, value]) => `${name} ${value}`)
    .join(", ");

/**
 * The base picture drawn here, for a run that left out the base's own test,
 * as one that names a test does. The clock is given back after, so the
 * mode's picture starts at zero, as the base's did.
 *
 * @note Impure: mounts on a renderer and fakes the timers, then restores them.
 */
async function drawBase(
  story: PreparedStory,
  viewport: Viewport,
): Promise<string> {
  const screen = await runStory(story, viewport);
  const text = formatGolden(screen.screenshot());
  await screen.unmount();
  vi.useRealTimers();
  return text;
}

/**
 * One story's test in one mode at one size. The story is drawn with the
 * mode's globals and compared with the base picture at the same size. Equal,
 * it keeps no golden, and fails only when the mode expects, by one of the
 * story's tags, to change it. Different, it is compared with the mode's own
 * golden, as any picture is. What was drawn is left on the task whatever the
 * outcome, so a reporter can show it.
 *
 * @note Impure: mounts on a renderer and reads the golden.
 */
export default async function checkMode(
  {
    file,
    story,
    comment,
    viewportName,
    viewport,
    modeName,
    mode,
    golden,
    base,
    onEqual,
  }: Subject,
  task: TestContext["task"],
): Promise<void> {
  const basePicture = base ?? (await drawBase(story, viewport));
  const screen = await runStory(story, viewport, mode.globals);
  const actual = screen.screenshot();
  const text = formatGolden(actual);
  const equal = text === basePicture;
  const expecting = story.tags.find((tag) => mode.expect?.tags.includes(tag));
  task.meta.lago = {
    file,
    title: story.title,
    name: story.name,
    description: readDescription(story.parameters) ?? (comment || undefined),
    tags: story.tags,
    viewportName,
    mode: modeName,
    globals: resolveGlobals(story, mode.globals),
    comparison: { equal, expectedToDiffer: expecting !== undefined },
    golden,
    actual,
    text,
    expected: equal ? undefined : readGolden(golden),
  };
  if (!equal) {
    await expect(text).toMatchFileSnapshot(golden);
    return;
  }
  onEqual();
  if (expecting !== undefined) {
    // A story that fixes every global the mode sets is drawn as in the base
    // by its own choice, which the reader is told apart from a value that
    // got lost on its way to the component.
    const set = Object.keys(mode.globals);
    const reason = set.every((name) => Object.hasOwn(story.globals, name))
      ? `the story fixes ${set.join(", ")} itself`
      : `${writeGlobals(mode.globals)} did not reach the story`;
    throw new Error(
      `The mode ${modeName} expects to change the stories tagged ${expecting}, but ${story.title} ${story.name} at ${viewportName} draws the base picture: ${reason}.`,
    );
  }
}
