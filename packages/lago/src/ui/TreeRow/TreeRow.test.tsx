import { render } from "@aztlan/lago-react";
import { TokensProvider, tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";
import { describe, expect, it } from "vitest";
import { sampleCatalog } from "../../../testing/catalogs.js";
import TreeRow from "./TreeRow.js";

const [keyBar, notice] = sampleCatalog.groups.at(0)?.components ?? [];

describe("TreeRow", () => {
  it("gives the worst status, the name and the count of stories at the right edge", async () => {
    if (!keyBar) throw new Error("no component");
    const screen = await render(
      <TreeRow component={keyBar} selected={false} width={27} />,
      {
        cols: 27,
        rows: 1,
      },
    );
    expect(screen.lines).toEqual(
      ["± KeyBar                  2"].map((line) => line.slice(0, 27)),
    );
    expect(screen.getByText("±").fg).toBe(tokens["color.text.warning"].slot);
  });

  it("shades the selected row, and cuts a long name in its middle", async () => {
    if (!notice) throw new Error("no component");
    const screen = await render(
      <TreeRow
        component={{ ...notice, name: "AVeryLongComponentName" }}
        selected
        width={20}
      />,
      { cols: 20, rows: 1 },
    );
    expect(screen.lines.at(0)).toBe("✗ AVeryLo…nentName 2");
    expect(screen.getByText("2").bg).toBe(
      tokens["color.background.selected"].slot,
    );
  });

  it("takes its status's colour and its shade from the tokens it is drawn under", async () => {
    if (!keyBar) throw new Error("no component");
    const screen = await render(
      <TokensProvider
        tokens={{
          ...tokens,
          "color.text.warning": RGBA.fromHex("#8a5a00"),
          "color.background.selected": RGBA.fromHex("#dddddd"),
        }}
      >
        <TreeRow component={keyBar} selected width={27} />
      </TokensProvider>,
      { cols: 27, rows: 1 },
    );
    expect(screen.getByText("±").fg).toBe("#8a5a00");
    expect(screen.getByText("KeyBar").bg).toBe("#dddddd");
  });
});
