import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import PaletteContext from "./PaletteContext.js";
import usePalette from "./usePalette.js";

/** Draws the palette's name and its first colour. */
function Probe() {
  const { name, colours } = usePalette();
  return <text>{`${name} ${colours?.at(0) ?? "own"}`}</text>;
}

describe("usePalette", () => {
  it("gives the terminal's own palette outside a provider, and the provider's within one", async () => {
    expect((await render(<Probe />, { cols: 20, rows: 1 })).lines).toEqual([
      "terminal own",
    ]);
    const colours = Array.from({ length: 16 }, () => "#21222c");
    const screen = await render(
      <PaletteContext.Provider value={{ name: "dracula", colours }}>
        <Probe />
      </PaletteContext.Provider>,
      { cols: 20, rows: 1 },
    );
    expect(screen.lines).toEqual(["dracula #21222c"]);
  });
});
