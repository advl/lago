import { RGBA } from "@opentui/core";
import { describe, expect, it } from "vitest";
import draw from "../../../testing/draw.js";
import { Notice } from "../component/index.js";
import { Pane } from "../layout/index.js";
import { tokens } from "./constants.js";
import TokensProvider from "./TokensProvider.js";

const chrome = {
  ...tokens,
  "color.text": RGBA.fromHex("#202020"),
  "color.text.error": RGBA.fromHex("#b00000"),
  "color.background": RGBA.fromHex("#f8f8f8"),
};

describe("TokensProvider", () => {
  it("draws the components under it in the colours it gives, each beside its glyph", async () => {
    const screen = await draw(
      <TokensProvider tokens={chrome}>
        <Notice reason="the tool needs git" recovery="install git" width={40} />
      </TokensProvider>,
      40,
      2,
    );
    expect(screen.getByText("✗ the tool").fg).toBe("#b00000");
    expect(screen.getByText("Recovery").fg).toBe("#202020");
  });

  it("paints a pane's whole screen with the set's background", async () => {
    const screen = await draw(
      <TokensProvider tokens={chrome}>
        <Pane
          name="tool"
          minColumns={10}
          minLines={3}
          width={20}
          height={4}
          header={null}
          keys={null}
        >
          <text fg={chrome["color.text"]}>body</text>
        </Pane>
      </TokensProvider>,
      20,
      4,
    );
    const runs = screen.screenshot().lines.flat();
    expect(runs.map(({ x, width }) => [x, width])).toEqual(
      Array.from({ length: 4 }, () => [0, 20]),
    );
    expect(new Set(runs.map(({ bg }) => bg))).toEqual(new Set(["#f8f8f8"]));
  });
});
