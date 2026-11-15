import { describe, expect, it, vi } from "vitest";
import draw from "../../../../testing/draw.js";
import readColor from "../../../../testing/readColor.js";
import readLook from "../../../../testing/readLook.js";
import { tokens } from "../../tokens/index.js";
import ScrolledList from "./ScrolledList.js";
import meta, { Pinned, Top } from "./ScrolledList.stories.js";

describe("ScrolledList", () => {
  it("draws the whole blocks that fit from the top, the first heading in its place, and counts the rows below, dimmed", async () => {
    const screen = await draw(
      <ScrolledList {...meta.args} {...Top.args} />,
      40,
      6,
    );
    expect(screen.lines).toEqual([
      `● bob ${"─".repeat(34)}`,
      "│ first of bob's",
      "╵ an item",
      "│ second of bob's",
      "╵ an item",
      "  ↓ 2 below",
    ]);
    expect(readLook(screen, "↓ 2 below")?.fg).toBe(
      readColor(tokens["color.text.muted"]),
    );
  });

  it("pins the heading of the first row's group, with the row's place among the group's", async () => {
    const screen = await draw(
      <ScrolledList {...meta.args} {...Pinned.args} />,
      40,
      6,
    );
    expect(screen.lines).toEqual([
      `● bob · 2 of 3 ${"─".repeat(25)}`,
      "│ second of bob's",
      "╵ an item",
      "│ third of bob's",
      "╵ an item",
      "  ↓ 1 below",
    ]);
    expect(readLook(screen, "● bob").fg).toBe(4);
  });

  it("tells how many rows it shows, headings not counted, and the first block it shows", async () => {
    const onShown = vi.fn();
    await draw(
      <ScrolledList {...meta.args} {...Pinned.args} onShown={onShown} />,
      40,
      6,
    );
    expect(onShown).toHaveBeenLastCalledWith(2, 2);
  });

  it("signs nothing once every row fits", async () => {
    const screen = await draw(
      <ScrolledList {...meta.args} {...Top.args} height={10} />,
      40,
      10,
    );
    expect(screen.lines.at(-1)).toBe("╵ an item");
    expect(screen.lines.join("\n")).not.toContain("below");
  });

  it("creates nodes only for blocks visible in the viewport", async () => {
    const make = Array.from({ length: 10 }, (_, index) =>
      vi.fn(() => <text>{`row ${index}`}</text>),
    );
    const blocks = make.map((node, index) => ({
      kind: "row" as const,
      key: `${index}`,
      lines: 1,
      node,
    }));
    const screen = await draw(
      <ScrolledList
        blocks={blocks}
        from={0}
        to={0}
        height={3}
        width={40}
        onShown={() => {}}
      />,
      40,
      3,
    );
    expect(screen.lines).toEqual(["row 0", "row 1", "  ↓ 8 below"]);
    expect(make[0]).toHaveBeenCalled();
    expect(make[1]).toHaveBeenCalled();
    expect(make[2]).not.toHaveBeenCalled();
  });
});
