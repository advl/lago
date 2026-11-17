import { render } from "@aztlan/lago-react";
import { useKeyboard } from "@opentui/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import { crowdedCatalog, modesCatalog } from "../../../testing/catalogs.js";
import { filterComponents } from "../../search/index.js";
import { listColumns, listRows } from "../../state/index.js";
import Matrix from "./Matrix.js";

const rows = listRows(filterComponents(crowdedCatalog, ""));
const columns = listColumns(crowdedCatalog);

/** The crowded matrix at `cols` by `lines`, its selection moved by j, k, h and l. */
function Moving({ cols, lines }: { cols: number; lines: number }) {
  const [at, setAt] = useState({ row: 0, column: 0 });
  const shown = useRef({ row: 0, column: 0 });
  useKeyboard(({ name }) => {
    const by = { j: [1, 0], k: [-1, 0], l: [0, 1], h: [0, -1] }[name];
    if (by) {
      setAt(({ row, column }) => ({
        row: row + (by.at(0) ?? 0),
        column: column + (by.at(1) ?? 0),
      }));
    }
  });
  const selected = rows.at(at.row);
  return (
    <Matrix
      components={filterComponents(crowdedCatalog, "")}
      columns={columns}
      selected={{
        title: selected?.component.title,
        story: selected?.place ?? 0,
        column: at.column,
      }}
      filter=""
      first={shown.current}
      onShown={(first) => {
        shown.current = first;
      }}
      width={cols}
      height={lines}
    />
  );
}

describe("Matrix", () => {
  it("shows every row and column that fits, and names in its title which are shown when they do not all fit", async () => {
    const screen = await render(<Moving cols={80} lines={12} />, {
      cols: 80,
      rows: 12,
    });
    expect(screen.lines.at(0)).toMatch(
      /^┌─matrix · 24 stories in 12 columns · stories 1–6, columns 1–5─/,
    );
    expect(screen.lines.at(2)).toMatch(
      /^│story +base +dark +ascii +solarized… high-cont… +│$/,
    );
    expect(screen.lines.at(3)).toContain("▸ Badge Story1 [✓]");
  });

  it("scrolls as little as keeps the selected cell in view, down and back up, and across", async () => {
    const screen = await render(<Moving cols={80} lines={12} />, {
      cols: 80,
      rows: 12,
    });
    await screen.userEvent.keyboard("jjjjjjjj");
    expect(screen.lines.at(0)).toContain("stories 4–9");
    expect(screen.lines.at(8)).toContain("▸ Field Story1 [✓]");
    await screen.userEvent.keyboard("kkk");
    expect(screen.lines.at(0)).toContain("stories 4–9");
    await screen.userEvent.keyboard("kkkk");
    expect(screen.lines.at(0)).toContain("stories 2–7");
    await screen.userEvent.keyboard("llllll");
    expect(screen.lines.at(0)).toContain("columns 3–7");
    expect(screen.lines.at(1)).toMatch(/^│ +terminal +wide +│$/);
    expect(screen.lines.at(3)).toMatch(/^│▸ Badge Story2 .*\[✓\] +│$/);
  });

  it("cuts the stories' names to the room a narrow region leaves them, and keeps a row before the legend", async () => {
    const components = filterComponents(modesCatalog, "");
    const screen = await render(
      <Matrix
        components={components}
        columns={listColumns(modesCatalog).slice(0, 1)}
        selected={{ title: "component/Badge", story: 0, column: 0 }}
        filter=""
        first={{ row: 0, column: 0 }}
        onShown={() => {}}
        width={16}
        height={8}
      />,
      { cols: 16, rows: 8 },
    );
    expect(screen.lines.slice(3, 5)).toEqual([
      "│▸ Badge …[✓]  │",
      "│✓ pass        │",
    ]);
  });

  it("opens scrolled where it was last shown, and tells where it scrolled to", async () => {
    const told: { row: number; column: number }[] = [];
    const selected = rows.at(9);
    const screen = await render(
      <Matrix
        components={filterComponents(crowdedCatalog, "")}
        columns={columns}
        selected={{
          title: selected?.component.title,
          story: selected?.place ?? 0,
          column: 0,
        }}
        filter=""
        first={{ row: 8, column: 0 }}
        onShown={(first) => told.push(first)}
        width={80}
        height={12}
      />,
      { cols: 80, rows: 12 },
    );
    expect(screen.lines.at(0)).toContain("stories 9–14");
    expect(told.at(-1)).toEqual({ row: 8, column: 0 });
  });

  it("names the filter that leaves its rows, and says when it leaves none", async () => {
    const draw = (filter: string) =>
      render(
        <Matrix
          components={filterComponents(modesCatalog, filter)}
          columns={listColumns(modesCatalog)}
          selected={{ title: undefined, story: 0, column: 0 }}
          filter={filter}
          first={{ row: 0, column: 0 }}
          onShown={() => {}}
          width={80}
          height={12}
        />,
        { cols: 80, rows: 12 },
      ).then((screen) => screen.lines);
    expect((await draw("badge")).at(0)).toMatch(
      /^┌─matrix · \d+ stories in 6 columns · filtered by “badge”─/,
    );
    expect((await draw("card")).at(0)).toMatch(
      /^┌─matrix · 1 story in 6 columns · filtered by “card”─/,
    );
    const none = await draw("nothing like it");
    expect(none.at(0)).toMatch(
      /^┌─matrix · 0 stories in 6 columns · filtered by/,
    );
    expect(none.at(1)).toMatch(/^│no story to show +│$/);
  });
});
