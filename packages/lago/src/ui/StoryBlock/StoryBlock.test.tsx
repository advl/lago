import { render } from "@aztlan/lago-react";
import { tokens } from "@aztlan/tui";
import { describe, expect, it } from "vitest";
import { keysPicture } from "../../../testing/pictures.js";
import { makeRecord } from "../../../testing/records.js";
import StoryBlock from "./StoryBlock.js";
import type { StoryFrame } from "./types.js";

const frame = (overrides: Partial<StoryFrame>): StoryFrame => ({
  name: "Default",
  description: undefined,
  record: makeRecord("component/KeyBar", "Default", { actual: keysPicture }),
  extent: { cols: 16, rows: 5 },
  selected: false,
  matched: false,
  absent: "not drawn at this viewport",
  ...overrides,
});

describe("StoryBlock", () => {
  it("frames two stories side by side, each titled with its status and name, the selected marked", async () => {
    const screen = await render(
      <StoryBlock
        frames={[
          frame({ selected: true }),
          frame({ name: "Other", extent: { cols: 10, rows: 1 } }),
        ]}
        description={[]}
        under={false}
      />,
      { cols: 50, rows: 8 },
    );
    expect(screen.lines.at(0)).toBe("┌─▸ ✓ Default────┐  ┌─✓ Other──┐");
    expect(screen.lines.at(1)).toBe("│↑↓ move ?       │  │↑↓ move ? │");
  });

  it("sets a description beside its frame, or under it", async () => {
    const beside = await render(
      <StoryBlock
        frames={[frame({})]}
        description={["what it shows"]}
        under={false}
      />,
      { cols: 50, rows: 8 },
    );
    expect(beside.lines.at(0)).toMatch(/┐ {2}what it shows$/);
    const under = await render(
      <StoryBlock frames={[frame({})]} description={["what it shows"]} under />,
      { cols: 50, rows: 9 },
    );
    expect(under.lines.at(7)).toBe("what it shows");
  });

  it("shows the error a story threw, and that a story is not drawn at the viewport", async () => {
    const thrown = makeRecord("component/Notice", "Thrown", {
      status: "error",
      actual: undefined,
      error: "TypeError: no\n  at src/Notice.tsx:4:12",
    });
    const screen = await render(
      <StoryBlock
        frames={[
          frame({
            name: "Thrown",
            record: thrown,
            extent: { cols: 24, rows: 2 },
          }),
          frame({
            name: "Wide",
            record: undefined,
            extent: { cols: 26, rows: 1 },
          }),
        ]}
        description={[]}
        under={false}
      />,
      { cols: 60, rows: 5 },
    );
    expect(screen.lines.slice(0, 3)).toEqual([
      "┌─✗ Thrown───────────────┐  ┌─Wide─────────────────────┐",
      "│TypeError: no           │  │not drawn at this viewport│",
      "│at src/Notice.tsx:4:12  │  └──────────────────────────┘",
    ]);
  });
  it("borders a story the search found its text in apart from the others", async () => {
    const screen = await render(
      <StoryBlock
        frames={[frame({ matched: true })]}
        description={[]}
        under={false}
      />,
      { cols: 30, rows: 8 },
    );
    const looks = screen
      .screenshot()
      .lines.at(6)
      ?.map(({ fg }) => fg);
    expect(looks).toContain(tokens["color.text.warning"].slot);
  });
});
