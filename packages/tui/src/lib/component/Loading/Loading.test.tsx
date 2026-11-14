import { describe, expect, it } from "vitest";
import draw from "../../../../testing/draw.js";
import readColor from "../../../../testing/readColor.js";
import readLook from "../../../../testing/readLook.js";
import { tokens } from "../../tokens/index.js";
import Loading from "./Loading.js";
import meta, { Reading } from "./Loading.stories.js";

describe("Loading", () => {
  it("states the label in the text colour, within the width given", async () => {
    const screen = await draw(<Loading {...meta.args} {...Reading.args} />, 40);
    expect(screen.lines.at(0)).toBe("refresh in progress…");
    expect(readLook(screen, "refresh in progress")?.fg).toBe(
      readColor(tokens["color.text"]),
    );
  });

  it("states the same line at 60 columns", async () => {
    const screen = await draw(
      <Loading {...meta.args} {...Reading.args} width={58} />,
      60,
    );
    expect(screen.lines.at(0)).toBe("refresh in progress…");
  });

  it("cuts a label wider than the width at its last whole word", async () => {
    const screen = await draw(
      <Loading {...meta.args} {...Reading.args} width={12} />,
      12,
    );
    expect(screen.lines.at(0)).toBe("refresh in …");
  });
});
