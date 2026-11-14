import { describe, expect, it } from "vitest";
import draw from "../../../../testing/draw.js";
import readColor from "../../../../testing/readColor.js";
import readLook from "../../../../testing/readLook.js";
import { tokens } from "../../tokens/index.js";
import Notice from "./Notice.js";
import meta, {
  NotSetUp,
  ToolMissing,
  UnexpectedFailure,
} from "./Notice.stories.js";

describe("Notice", () => {
  it("wraps the reason and the recovery two cells in at 40 columns, keeping the command whole", async () => {
    const screen = await draw(
      <Notice {...meta.args} {...ToolMissing.args} />,
      40,
    );
    expect(screen.lines.slice(0, 4)).toEqual([
      "  ✗ the tool needs git",
      "  Recovery: install it from",
      "  https://git.example.com, then run",
      "  git init",
    ]);
  });

  it("draws the reason in the error colour and the recovery in the text colour", async () => {
    const screen = await draw(<Notice {...meta.args} {...NotSetUp.args} />, 40);
    expect(screen.lines.slice(0, 2)).toEqual([
      "  ✗ git has no user name configured",
      "  Recovery: run git config user.name",
    ]);
    expect(readLook(screen, "✗ git")?.fg).toBe(
      readColor(tokens["color.text.error"]),
    );
    expect(readLook(screen, "Recovery")?.fg).toBe(
      readColor(tokens["color.text"]),
    );
  });

  it("ends the command a recovery names at a semicolon, and wraps the rest", async () => {
    const screen = await draw(
      <Notice {...meta.args} {...UnexpectedFailure.args} />,
      40,
    );
    expect(screen.lines.slice(0, 4)).toEqual([
      "  ✗ the tool stopped on a failure it has",
      "  no name for: disk on fire",
      "  Recovery: run the command again; if it",
      "  keeps failing, report it",
    ]);
  });

  it("takes fewer lines at 60 columns", async () => {
    const screen = await draw(
      <Notice {...meta.args} {...ToolMissing.args} width={60} />,
      60,
    );
    expect(screen.lines.slice(0, 3)).toEqual([
      "  ✗ the tool needs git",
      "  Recovery: install it from https://git.example.com, then",
      "  run git init",
    ]);
  });
});
