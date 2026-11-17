import { render } from "@aztlan/lago-react";
import { Keys } from "@aztlan/tui";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { modesCatalog } from "../../../testing/catalogs.js";
import type { Catalog } from "../../catalog/index.js";
import Gallery from "./Gallery.js";

/** The gallery on `catalog`, at 80 by 24, with `F12` switching it to `next`, as a run would. */
async function open(catalog: Catalog, next: Catalog = catalog) {
  function Run() {
    const [shown, setShown] = useState(catalog);
    useKeyboard(({ name }) => {
      if (name === "f12") setShown(next);
    });
    return (
      <Gallery
        catalog={shown}
        name="project"
        onAccept={() => Promise.resolve()}
        onQuit={() => {}}
        width={80}
        height={24}
      />
    );
  }
  const screen = await render(
    <Keys>
      <Run />
    </Keys>,
    { cols: 80, rows: 24 },
  );
  const press = async (keys: string) => {
    await screen.userEvent.keyboard(keys);
    return screen.lines;
  };
  return press;
}

describe("useGalleryKeys", () => {
  it("leaves a search's matches unstepped while the matrix is open, and steps them again once it is closed", async () => {
    const press = await open(modesCatalog);
    expect((await press("{Enter}/badge{Enter}")).at(-2)).toMatch(
      /^“badge”: match 1 of 2 /,
    );
    const matrix = await press("x");
    expect(matrix.at(-1)).not.toContain("match");
    expect((await press("n")).at(-2)).toMatch(
      /^Badge Default at terminal: pass /,
    );
    expect((await press("{Escape}")).at(-2)).toMatch(/^“badge”: match 1 of 2 /);
    expect((await press("n")).at(-2)).toMatch(/^“badge”: match 2 of 2 /);
  });

  it("offers no move across a matrix a run has left with no story", async () => {
    const press = await open(modesCatalog, { ...modesCatalog, groups: [] });
    expect((await press("x")).at(-1)).toContain("←→ column");
    const emptied = await press("{F12}");
    expect(emptied.at(2)).toMatch(/^│no story to show +│$/);
    expect(emptied.at(-1)).not.toContain("←→");
    expect(emptied.at(-1)).toContain("esc back");
  });
});
