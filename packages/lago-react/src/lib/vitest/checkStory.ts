import { formatGolden } from "@aztlan/lago-core";
import { expect, type TestContext } from "vitest";
import type { Viewport } from "../render/index.js";
import {
  type PreparedStory,
  readDescription,
  runStory,
} from "../story/index.js";
import readGolden from "./readGolden.js";

interface Subject {
  readonly file: string;
  readonly story: PreparedStory;
  readonly comment: string | undefined;
  readonly viewportName: string;
  readonly viewport: Viewport;
  readonly golden: string;
}

/**
 * One story's test at one size: the story is mounted and played through
 * with time stopped, and what the screen shows is compared with the story's
 * golden. What was drawn is left on the task whatever the outcome, so a
 * reporter can show a story that failed.
 *
 * @note Impure: mounts on a renderer and reads the golden.
 */
export default async function checkStory(
  { file, story, comment, viewportName, viewport, golden }: Subject,
  task: TestContext["task"],
): Promise<void> {
  const screen = await runStory(story, viewport);
  const actual = screen.screenshot();
  const text = formatGolden(actual);
  task.meta.lago = {
    file,
    title: story.title,
    name: story.name,
    description: readDescription(story.parameters) ?? (comment || undefined),
    tags: story.tags,
    viewportName,
    golden,
    actual,
    text,
    expected: readGolden(golden),
  };
  await expect(text).toMatchFileSnapshot(golden);
}
