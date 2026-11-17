import { render } from "@aztlan/lago-react";
import { tokens } from "@aztlan/tui";
import { describe, expect, it } from "vitest";
import PluginStatus from "./PluginStatus.js";

const selection = {
  title: undefined,
  story: undefined,
  viewportName: "wide",
  mode: undefined,
  palette: "dracula",
};

describe("PluginStatus", () => {
  it("draws each item after a muted separator, a component given the selection", async () => {
    const screen = await render(
      <PluginStatus
        placed={{
          items: [
            { text: "palette dracula", columns: 15 },
            {
              columns: 4,
              component: ({ selection: { viewportName } }) => (
                <text>{viewportName}</text>
              ),
            },
          ],
          columns: 25,
        }}
        selection={selection}
      />,
      { cols: 25, rows: 1 },
    );
    expect(screen.lines).toEqual([" · palette dracula · wide"]);
    expect(screen.getByText("·").fg).toBe(tokens["color.text.muted"].slot);
  });
});
