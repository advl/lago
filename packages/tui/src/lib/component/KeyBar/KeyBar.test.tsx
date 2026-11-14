import { describe, expect, it } from "vitest";
import draw from "../../../../testing/draw.js";
import readColor from "../../../../testing/readColor.js";
import readLook from "../../../../testing/readLook.js";
import { tokens } from "../../tokens/index.js";
import KeyBar from "./KeyBar.js";
import meta, { Activity, Long, Owed } from "./KeyBar.stories.js";

describe("KeyBar", () => {
  it("shows each key with a hint, its label after it, at 40 columns", async () => {
    const screen = await draw(<KeyBar {...meta.args} {...Owed.args} />, 40);
    expect(screen.lines.at(0)).toBe("←→ mode ↑↓ sel g grp ?");
  });

  it("draws keys plain and labels dimmed, neither bold", async () => {
    const screen = await draw(<KeyBar {...meta.args} {...Owed.args} />, 40);
    expect(readLook(screen, "←→")).toMatchObject({
      fg: readColor(tokens["color.text"]),
      bold: false,
    });
    expect(readLook(screen, "mode")).toMatchObject({
      fg: readColor(tokens["color.text.muted"]),
      bold: false,
    });
  });

  it("adds the time window in activity, the same at 60 columns", async () => {
    const screen = await draw(
      <KeyBar {...meta.args} {...Activity.args} width={60} />,
      60,
    );
    expect(screen.lines.at(0)).toBe("←→ mode g grp t time ?");
  });

  it("leaves out the last hints whole when they do not all fit, keeping ? to the last", async () => {
    const screen = await draw(<KeyBar {...meta.args} {...Long.args} />, 40);
    expect(screen.lines.at(0)).toBe("←→ mode ↑↓ sel ⏎ open g grp t time a r ?");
    const narrow = await draw(
      <KeyBar {...meta.args} {...Activity.args} width={12} />,
      12,
    );
    expect(narrow.lines.at(0)).toBe("←→ mode ?");
    const least = await draw(
      <KeyBar {...meta.args} {...Activity.args} width={1} />,
      1,
    );
    expect(least.lines.at(0)).toBe("?");
  });

  it("draws nothing when not even ? fits", async () => {
    const screen = await draw(
      <KeyBar {...meta.args} {...Activity.args} width={0} />,
      1,
    );
    expect(screen.lines.at(0)).toBe("");
  });
});
