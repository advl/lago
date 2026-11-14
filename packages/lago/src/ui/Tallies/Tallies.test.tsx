import { render } from "@aztlan/lago-react";
import { tokens } from "@aztlan/tui";
import { describe, expect, it } from "vitest";
import Tallies from "./Tallies.js";

describe("Tallies", () => {
  it("counts each status with its glyph, colouring only the counts that call for a look", async () => {
    const screen = await render(
      <Tallies
        tallies={{ pass: 3, changed: 0, new: 1, error: 0 }}
        failures={0}
        width={60}
      />,
      { cols: 60, rows: 1 },
    );
    expect(screen.lines).toEqual([
      "✓ 3 pass · ± 0 changed · + 1 new · ✗ 0 error",
    ]);
    expect(screen.getByText("± 0 changed").fg).toBe("default");
    expect(screen.getByText("+ 1 new").fg).toBe(
      tokens["color.text.warning"].slot,
    );
  });

  it("adds the files that failed to load, and drops whole counts from the end in a narrow pane", async () => {
    const two = await render(
      <Tallies
        tallies={{ pass: 0, changed: 0, new: 0, error: 0 }}
        failures={2}
        width={80}
      />,
      { cols: 80, rows: 1 },
    );
    expect(two.lines.at(0)).toContain("✗ 2 files failed to load");
    const narrow = await render(
      <Tallies
        tallies={{ pass: 1, changed: 0, new: 0, error: 0 }}
        failures={1}
        width={30}
      />,
      { cols: 30, rows: 1 },
    );
    expect(narrow.lines.at(0)).toBe("✓ 1 pass · ± 0 changed · + 0 …");
  });
});
