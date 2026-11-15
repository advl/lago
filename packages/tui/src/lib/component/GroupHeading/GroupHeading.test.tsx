import { describe, expect, it } from "vitest";
import draw from "../../../../testing/draw.js";
import readColor from "../../../../testing/readColor.js";
import readLook from "../../../../testing/readLook.js";
import { tokens } from "../../tokens/index.js";
import GroupHeading from "./GroupHeading.js";
import meta, { Long, Marked, Pinned, Words } from "./GroupHeading.stories.js";

describe("GroupHeading", () => {
  it("names a group, then a rule to the region's edge, neither of them bold", async () => {
    const screen = await draw(
      <GroupHeading {...meta.args} {...Words.args} />,
      40,
    );
    expect(screen.lines.at(0)).toBe(`ISSUES ${"─".repeat(33)}`);
    expect(readLook(screen, "ISSUES")).toMatchObject({
      fg: readColor(tokens["color.text"]),
      bold: false,
    });
    expect(readLook(screen, "─").bold).toBe(false);
  });

  it("draws a name the caller fits itself, in the looks it gives", async () => {
    const screen = await draw(
      <GroupHeading {...meta.args} {...Marked.args} />,
      40,
    );
    expect(screen.lines.at(0)).toBe(`● bob ${"─".repeat(34)}`);
    expect(readLook(screen, "● bob").fg).toBe(4);
  });

  it("gives the caller's function the cells the count and the rule leave", async () => {
    const rooms: number[] = [];
    await draw(
      <GroupHeading
        name={(room) => {
          rooms.push(room);
          return [{ text: "x", fg: tokens["color.text"] }];
        }}
        count={{ text: "3 of 5", kind: "figure" }}
        width={40}
      />,
      40,
    );
    expect(rooms.at(-1)).toBe(40 - 2 - " · 3 of 5".length);
  });

  it("draws the rule to the edge of a wider region", async () => {
    const screen = await draw(
      <GroupHeading {...meta.args} {...Words.args} width={60} />,
      60,
    );
    expect(screen.lines.at(0)).toBe(`ISSUES ${"─".repeat(53)}`);
  });

  it("cuts a name wider than the region by its kind's rule, leaving room for the rule", async () => {
    const screen = await draw(
      <GroupHeading {...meta.args} {...Long.args} width={24} />,
      24,
    );
    expect(screen.lines.at(0)).toBe("example-re…ease-branch ─");
  });

  it("gives the pinned group's count after the name, plain, then the rule", async () => {
    const screen = await draw(
      <GroupHeading {...meta.args} {...Pinned.args} />,
      40,
    );
    expect(screen.lines.at(0)).toBe(`● bob · 3 of 5 ${"─".repeat(25)}`);
    expect(readLook(screen, "· 3 of 5")).toMatchObject({
      fg: readColor(tokens["color.text"]),
      bold: false,
    });
  });

  it("fits the name and the count by a caller's own table", async () => {
    const rules = {
      team: { line: { drop: /^[^/]*\//, cut: "cutEnd" }, block: "wrap" },
    } as const;
    const screen = await draw(
      <GroupHeading
        name={{ text: "example-org/parser-team", kind: "team" }}
        rules={rules}
        width={40}
      />,
      40,
    );
    expect(screen.lines.at(0)).toBe(`parser-team ${"─".repeat(28)}`);
  });
});
