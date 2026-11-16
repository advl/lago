import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { formatGolden } from "@aztlan/lago-core";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import * as clock from "../../../testing/Clock.stories.js";
import {
  listStories,
  type PreparedStory,
  runStory,
  type StoryContext,
} from "../story/index.js";
import checkMode from "./checkMode.js";
import type { StoryResult } from "./types.js";

const viewport = { cols: 24, rows: 1 };

const [schemed] = listStories(
  {
    default: { title: "fixtures/Schemed", tags: ["themed"] },
    Schemed: {
      render: (_args: unknown, { globals }: StoryContext) => (
        <text>{`scheme ${globals.scheme}`}</text>
      ),
    },
  },
  "the module",
  { globalTypes: { scheme: { values: ["light", "dark"], default: "light" } } },
) as [PreparedStory];

/** A task as vitest gives one, holding only what the check writes. */
const makeTask = () => ({ meta: {} as { lago?: StoryResult } });

function makeSubject(story: PreparedStory, base: string | undefined) {
  const folder = mkdtempSync(join(tmpdir(), "lago-goldens-"));
  onTestFinished(() => rmSync(folder, { recursive: true, force: true }));
  const onEqual = vi.fn();
  return {
    file: "/project/src/Schemed.stories.tsx",
    story,
    comment: "In a scheme.",
    viewportName: "narrow",
    viewport,
    modeName: "dark",
    mode: { globals: { scheme: "dark" }, expect: { tags: ["themed"] } },
    golden: join(folder, "Schemed.Schemed.narrow@dark.golden"),
    base,
    onEqual,
  };
}

/** What a story draws in a mode, as a golden's text, drawn on a test of its own clock. */
async function drawText(story: PreparedStory, scheme?: string) {
  const screen = await runStory(
    story,
    viewport,
    scheme === undefined ? undefined : { scheme },
  );
  const text = formatGolden(screen.screenshot());
  await screen.unmount();
  vi.useRealTimers();
  return text;
}

describe("checkMode", () => {
  it("passes a picture equal to the base's, keeping no golden, and says so on the task", async () => {
    const [plain] = listStories(clock, "the module") as [PreparedStory];
    const subject = makeSubject(plain, await drawText(plain));
    const task = makeTask();
    await checkMode(subject, task as never);
    expect(subject.onEqual).toHaveBeenCalledOnce();
    expect(task.meta.lago).toMatchObject({
      title: "fixtures/Clock",
      name: "AtZero",
      description: "In a scheme.",
      viewportName: "narrow",
      mode: "dark",
      globals: {},
      comparison: { equal: true, expectedToDiffer: false },
      golden: subject.golden,
      expected: undefined,
    });
  });

  it("draws the base itself when the run left the base's test out, each picture from zero", async () => {
    const { AfterASecond } = clock;
    const [, later] = listStories(
      { default: clock.default, AtZero: clock.AtZero, AfterASecond },
      "the module",
    ) as [PreparedStory, PreparedStory];
    const subject = makeSubject(later, undefined);
    const task = makeTask();
    await checkMode(subject, task as never);
    expect(task.meta.lago?.comparison?.equal).toBe(true);
    expect(task.meta.lago?.text).toContain("date 1000");
  });

  it("passes a story of a mode that expects no story to change", async () => {
    const subject = {
      ...makeSubject(schemed, await drawText(schemed, "dark")),
      comment: "",
      mode: { globals: { scheme: "dark" } },
    };
    const task = makeTask();
    await checkMode(subject, task as never);
    expect(task.meta.lago?.comparison).toEqual({
      equal: true,
      expectedToDiffer: false,
    });
    expect(task.meta.lago?.description).toBeUndefined();
  });

  it("compares a picture that differs from the base's with the mode's golden", async () => {
    const subject = makeSubject(schemed, await drawText(schemed));
    const text = await drawText(schemed, "dark");
    writeFileSync(subject.golden, text);
    const task = makeTask();
    await checkMode(subject, task as never);
    expect(subject.onEqual).not.toHaveBeenCalled();
    expect(task.meta.lago).toMatchObject({
      globals: { scheme: "dark" },
      comparison: { equal: false, expectedToDiffer: true },
      text,
      expected: { cols: 24, rows: 1 },
    });
    expect(readFileSync(subject.golden, "utf8")).toBe(text);
  });

  it("fails a story the mode expects to change whose picture is the base's, naming the mode", async () => {
    const subject = makeSubject(schemed, await drawText(schemed, "dark"));
    const task = makeTask();
    await expect(checkMode(subject, task as never)).rejects.toThrow(
      "The mode dark expects to change the stories tagged themed, but fixtures/Schemed Schemed at narrow draws the base picture: scheme dark did not reach the story.",
    );
    expect(subject.onEqual).toHaveBeenCalledOnce();
    expect(task.meta.lago?.comparison).toEqual({
      equal: true,
      expectedToDiffer: true,
    });
  });

  it("says so when a story the mode expects to change fixes the mode's globals itself", async () => {
    const fixed = { ...schemed, globals: { scheme: "light" } };
    const subject = makeSubject(fixed, await drawText(fixed));
    await expect(checkMode(subject, makeTask() as never)).rejects.toThrow(
      "The mode dark expects to change the stories tagged themed, but fixtures/Schemed Schemed at narrow draws the base picture: the story fixes scheme itself.",
    );
  });
});
