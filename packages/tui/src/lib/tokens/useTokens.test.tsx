import { RGBA } from "@opentui/core";
import { describe, expect, it } from "vitest";
import draw from "../../../testing/draw.js";
import { tokens } from "./constants.js";
import TokensProvider from "./TokensProvider.js";
import useTokens from "./useTokens.js";

/** Writes the separator glyph of the set it is drawn under. */
function Separator() {
  return <text>{useTokens()["glyph.separator"]}</text>;
}

describe("useTokens", () => {
  it("gives the terminal's own set where no provider gives one", async () => {
    let read: unknown;
    function Reader() {
      read = useTokens();
      return null;
    }
    await draw(<Reader />, 10, 1);
    expect(read).toBe(tokens);
  });

  it("gives the set of the nearest provider", async () => {
    const outer = { ...tokens, "glyph.separator": "|" };
    const inner = { ...tokens, "glyph.separator": "/" };
    const screen = await draw(
      <TokensProvider tokens={outer}>
        <box flexDirection="column">
          <Separator />
          <TokensProvider tokens={inner}>
            <Separator />
          </TokensProvider>
        </box>
      </TokensProvider>,
      10,
      2,
    );
    expect(screen.lines).toEqual(["|", "/"]);
  });

  it("reads a colour from the set at draw time, never one fixed at load", async () => {
    function Failure() {
      return <text fg={useTokens()["color.text.error"]}>failed</text>;
    }
    const screen = await draw(
      <TokensProvider
        tokens={{ ...tokens, "color.text.error": RGBA.fromHex("#aa0000") }}
      >
        <Failure />
      </TokensProvider>,
      10,
      1,
    );
    expect(screen.getByText("failed").fg).toBe("#aa0000");
  });
});
