import { render, type Screen } from "@aztlan/lago-react";
import { Keys } from "@aztlan/tui";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  crowdedCatalog,
  modesCatalog,
  passingCatalog,
  sampleCatalog,
} from "../../../testing/catalogs.js";
import { drawPicture } from "../../../testing/records.js";
import type { Catalog, StoryRecord } from "../../catalog/index.js";
import Gallery from "./Gallery.js";

interface Opened {
  readonly screen: Screen;
  readonly onAccept: ReturnType<
    typeof vi.fn<(record: StoryRecord) => Promise<void>>
  >;
  readonly onQuit: ReturnType<typeof vi.fn<() => void>>;
}

interface OpenOptions {
  readonly cols?: number;
  readonly rows?: number;
  /** The catalog F12 switches to, as a run would give it. */
  readonly next?: Catalog | undefined;
  readonly accept?: () => Promise<void>;
  /** The terminal's width once F11 is pressed, as a resize would give it. */
  readonly widened?: number;
}

/** The gallery on `catalog`, with `F12` switching it to `next`, as a run would. */
async function open(
  catalog: Catalog | undefined,
  {
    cols = 80,
    rows = 24,
    next = catalog,
    accept = () => Promise.resolve(),
    widened = cols,
  }: OpenOptions = {},
): Promise<Opened> {
  const onAccept = vi.fn<(record: StoryRecord) => Promise<void>>(accept);
  const onQuit = vi.fn<() => void>();
  function Run() {
    const [shown, setShown] = useState(catalog);
    const [width, setWidth] = useState(cols);
    useKeyboard(({ name }) => {
      if (name === "f12") setShown(next);
      if (name === "f11") setWidth(widened);
    });
    return (
      <Gallery
        catalog={shown}
        name="project"
        onAccept={onAccept}
        onQuit={onQuit}
        width={width}
        height={rows}
      />
    );
  }
  const screen = await render(
    <Keys>
      <Run />
    </Keys>,
    { cols: Math.max(cols, widened), rows },
  );
  return { screen, onAccept, onQuit };
}

const press = async (screen: Screen, keys: string) => {
  await screen.userEvent.keyboard(keys);
  return screen.lines;
};

describe("Gallery", () => {
  it("opens on the tree beside the first component's stories, with the counts, a failed file and the keys", async () => {
    const { screen } = await open(sampleCatalog);
    expect(screen.lines.at(0)).toMatch(
      /^project +at terminal · as the room allows$/,
    );
    expect(
      screen.lines.slice(1, 6).map((line) => line.slice(0, 28).trimEnd()),
    ).toEqual([
      `component ${"─".repeat(17)}`,
      "± KeyBar                  2",
      "✗ Notice                  2",
      `layout ${"─".repeat(20)}`,
      "✓ Pane                    1",
    ]);
    expect(screen.lines.at(1)).toContain("▸ ✓ Default");
    expect(screen.lines.slice(-3)).toEqual([
      "✓ 4 pass · ± 2 changed · + 1 new · ✗ 1 error · ✗ 1 file failed to load",
      "/project/src/Broken.stories.tsx: Cannot find module './Missing.js'",
      "↑↓ move ⏎ open / find p viewport v layout ? q quit",
    ]);
  });

  it("chooses a component, opens its stories, and comes back to the tree", async () => {
    const { screen } = await open(sampleCatalog);
    expect((await press(screen, "j")).at(1)).toContain("▸ + Missing");
    const opened = await press(screen, "{Enter}");
    expect(opened.at(0)).toMatch(/^component\/Notice +at terminal/);
    expect(opened.at(-1)).toContain("esc back");
    expect((await press(screen, "j")).at(5)).toContain("▸ ✗ Thrown");
    expect((await press(screen, "{Escape}")).at(0)).toMatch(/^project /);
  });

  it("inspects a story at its whole size, scrolling a picture taller than the region", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "jj{Enter}{Enter}");
    expect(screen.lines.at(1)).toContain("✓ Tall at terminal · pass");
    expect(screen.lines.at(2)).toContain("line 1");
    const scrolled = await press(screen, "jjj");
    expect(scrolled.at(2)).toContain("line 4");
    expect(scrolled.at(-1)).toContain("↑↓ scroll");
    expect((await press(screen, "{Escape}")).at(1)).toContain("▸ ✓ Tall");
  });

  it("shows the error a story threw, with its place", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "j{Enter}j{Enter}");
    expect(screen.lines.at(2)).toContain(
      "TypeError: cannot read properties of undefined",
    );
    expect(screen.lines.at(3)).toContain("at src/Notice.tsx:4:12");
  });

  it("shows the golden over a changed picture, the difference in words", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "{Enter}l{Enter}d");
    expect(
      screen.lines.slice(2, 6).map((line) => line.slice(1, -1).trimEnd()),
    ).toEqual([
      "1 line differs: 1 in text.",
      "",
      "  2 − a long bar",
      "    + a longer bar",
    ]);
    expect((await press(screen, "{Escape}")).at(3)).toContain("a longer bar");
  });

  it("reads the cell under a cursor in words, and moves the cursor", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "{Enter}{Enter}c");
    expect(screen.lines.at(-2)).toBe(
      "column 1, line 1: “↑↓” · fg the terminal's own · bg the terminal's own",
    );
    expect((await press(screen, "lll")).at(-2)).toBe(
      "column 4, line 1: “move” · fg palette 7 · bg the terminal's own",
    );
    expect((await press(screen, "jjjhhh")).at(-2)).toBe(
      "column 1, line 4: “ selected row ” · fg palette 2 · bg the terminal's own · inv…",
    );
    expect((await press(screen, "{Escape}")).at(-2)).toContain(
      "Broken.stories.tsx",
    );
  });

  it("accepts a changed picture once asked and confirmed, and says so", async () => {
    const { screen, onAccept } = await open(sampleCatalog);
    await press(screen, "{Enter}l{Enter}{Shift>}a{/Shift}");
    expect(screen.lines.at(-2)).toBe(
      "accept Long at terminal as its golden? y accepts, Esc keeps the golden",
    );
    await press(screen, "y");
    expect(onAccept).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Long", viewportName: "terminal" }),
    );
    expect(await screen.findByText("accepted Long at terminal")).toBeDefined();
  });

  it("keeps the golden when the question is answered with Esc, and says why an acceptance failed", async () => {
    const kept = await open(sampleCatalog);
    await press(kept.screen, "{Enter}l{Enter}{Shift>}a{/Shift}{Escape}");
    expect(kept.onAccept).not.toHaveBeenCalled();
    expect(kept.screen.lines.at(-2)).toContain("Broken.stories.tsx");
    const failed = await open(sampleCatalog, {
      accept: () => Promise.reject(new Error("the disk is full")),
    });
    await press(failed.screen, "{Enter}l{Enter}{Shift>}a{/Shift}y");
    expect(
      await failed.screen.findByText(
        "Long at terminal was not accepted: the disk is full",
      ),
    ).toBeDefined();
  });

  it("drops the question when a run removes the picture asked about", async () => {
    const { screen, onAccept } = await open(sampleCatalog, {
      next: passingCatalog,
    });
    await press(screen, "{Enter}l{Enter}{Shift>}a{/Shift}{F12}y");
    expect(onAccept).not.toHaveBeenCalled();
    expect(screen.lines.at(-2)).toBe("watching the stories for changes");
  });

  it("filters the tree as the filter is typed, keeps it, and clears it with Esc", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "/pa");
    expect(screen.lines.at(-2)).toBe("filter: pa▏");
    expect(
      screen.lines.slice(1, 3).map((line) => line.slice(0, 28).trimEnd()),
    ).toEqual([`layout ${"─".repeat(20)}`, "✓ Pane                    1"]);
    await press(screen, "{Backspace}{Backspace}zz{Enter}");
    expect(screen.lines.at(1)).toContain("no component matches “zz”");
    await press(screen, "/{Escape}");
    expect(screen.lines.at(2)).toContain("± KeyBar");
  });

  it("searches the stories' names and drawn text, and steps through the matches", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "{Enter}/move{Enter}");
    expect(screen.lines.at(-2)).toBe("“move”: match 1 of 2");
    expect(screen.lines.at(1)).toContain("▸ ✓ Default");
    expect((await press(screen, "n")).at(-2)).toBe("“move”: match 2 of 2");
    expect((await press(screen, "{Shift>}n{/Shift}")).at(-2)).toBe(
      "“move”: match 1 of 2",
    );
    await press(screen, "/zz{Enter}");
    expect(screen.lines.at(-2)).toBe("“zz”: no match");
  });

  it("steps to the next viewport and the next arrangement", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "j{Enter}p");
    expect(screen.lines.at(0)).toMatch(/at wide · as the room allows$/);
    expect(screen.lines.join("\n")).toContain("not drawn at this");
    expect((await press(screen, "{Enter}")).at(2)).toContain(
      "This story is not drawn at wide.",
    );
    await press(screen, "{Escape}p{Escape}k{Enter}v");
    expect(screen.lines.at(0)).toMatch(/at terminal · in rows$/);
    expect(screen.lines.join("\n")).toContain("The keys that work now");
    expect((await press(screen, "v")).at(0)).toMatch(/side by side$/);
  });

  it("shows every key in the help, scrolls it, and closes it", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "?");
    expect(screen.lines.at(0)).toMatch(/^project/);
    expect(screen.lines.at(2)).toMatch(/^Move ─/);
    expect(screen.lines.join("\n")).toContain("scroll the help");
    await press(screen, "jjjjjjjjjjjjjjjjjjjj");
    expect(screen.lines.join("\n")).toContain(
      "the pictures are drawn by the project's own vitest",
    );
    const end = screen.lines.at(2);
    expect((await press(screen, "k")).at(2)).not.toBe(end);
    await press(screen, "kkkkkkkkkkkkkkkkkkkkkkkkk");
    expect(screen.lines.at(2)).toMatch(/^Move ─/);
    expect((await press(screen, "{Escape}")).at(1)).toMatch(/^component ─/);
  });

  it("quits with q", async () => {
    const { screen, onQuit } = await open(sampleCatalog);
    await press(screen, "q");
    expect(onQuit).toHaveBeenCalledOnce();
  });

  it("says the stories are running before the first catalog, and that there are none in an empty project", async () => {
    const running = await open(undefined);
    expect(running.screen.lines.at(1)).toBe("running the stories…");
    expect(running.screen.lines.at(-2)).toBe("running the stories…");
    const empty = await open(passingCatalog, {
      next: { ...passingCatalog, groups: [], viewports: [] },
    });
    await press(empty.screen, "{F12}");
    expect(empty.screen.lines.at(1)).toContain("no stories yet");
  });

  it("says only that the terminal is too small below 80 columns", async () => {
    const { screen } = await open(sampleCatalog, { cols: 79 });
    expect(screen.lines.filter(Boolean)).toEqual(["lago needs 80 columns"]);
  });
  it("keeps the key bar whole as the cursor and the golden come and go", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "{Enter}l{Enter}");
    const inspecting = screen.lines.at(-1);
    expect((await press(screen, "c{Escape}")).at(-1)).toBe(inspecting);
    expect((await press(screen, "d{Escape}")).at(-1)).toBe(inspecting);
    expect((await press(screen, "c")).at(-1)).toContain("esc back");
  });

  it("holds the scroll within a tall picture, so the first key back moves it", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, `jj{Enter}{Enter}${"j".repeat(30)}`);
    expect(screen.lines.at(2)).toContain("line 13");
    expect((await press(screen, "k")).at(2)).toContain("line 12");
  });

  it("holds the cursor within the picture drawn", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, `{Enter}{Enter}c${"l".repeat(60)}${"j".repeat(40)}`);
    expect(screen.lines.at(-2)).toBe("column 40, line 5: nothing drawn");
  });

  it("drops the question when a run draws the picture asked about otherwise", async () => {
    const redrawn = {
      ...sampleCatalog,
      groups: sampleCatalog.groups.map((group) => ({
        ...group,
        components: group.components.map((component) => ({
          ...component,
          stories: component.stories.map((story) => ({
            ...story,
            pictures: story.pictures.map((picture) =>
              picture.name === "Long"
                ? {
                    ...picture,
                    text: "drawn otherwise",
                    actual: drawPicture(["drawn otherwise"]),
                  }
                : picture,
            ),
          })),
        })),
      })),
    };
    const { screen, onAccept } = await open(sampleCatalog, { next: redrawn });
    await press(screen, "{Enter}l{Enter}{Shift>}a{/Shift}{F12}y");
    expect(onAccept).not.toHaveBeenCalled();
    expect(screen.lines.at(-2)).not.toContain("accept Long");
  });

  it("acts on no key but quitting while the terminal is too small", async () => {
    const { screen, onAccept } = await open(sampleCatalog, {
      cols: 79,
      widened: 80,
    });
    await press(screen, "j{Enter}l{Enter}{Shift>}a{/Shift}y");
    expect(onAccept).not.toHaveBeenCalled();
    await press(screen, "{F11}");
    expect(screen.lines.at(0)).toMatch(/^project /);
    expect(screen.lines.at(1)).toContain("▸ ✓ Default");
  });

  it("types a paste into the filter as one line", async () => {
    const { screen } = await open(sampleCatalog);
    await press(screen, "/");
    await screen.userEvent.paste("Pa\nne");
    expect(screen.lines.at(-2)).toBe("filter: Pa ne▏");
  });

  it("offers no move and no layout while there is nothing to move through", async () => {
    const { screen } = await open(undefined);
    expect(screen.lines.at(-1)).toBe("/ find ? q quit");
  });

  it("steps through the modes with m, the base first, naming the size and the mode after the status", async () => {
    const { screen } = await open(modesCatalog);
    await press(screen, "{Enter}");
    expect(screen.lines.at(-2)).toMatch(
      /^watching the stories for changes +terminal · base$/,
    );
    expect(screen.lines.at(-1)).toContain("m mode");
    const dark = await press(screen, "m");
    expect(dark.at(-2)).toMatch(/ terminal · dark$/);
    expect(dark.at(2)).toContain("● dark badge");
    expect(dark.join("\n")).toContain("! Quiet");
    expect(dark.join("\n")).toContain("scheme dark did not reach");
    const ascii = await press(screen, "m");
    expect(ascii.at(-2)).toMatch(/ terminal · ascii$/);
    expect(ascii.at(1)).toContain("= Default");
    expect(ascii.join("\n")).toContain("left out of ascii");
    expect((await press(screen, "m")).at(-2)).toMatch(/ terminal · base$/);
  });

  it("shows a mode's picture equal to the base as the base picture, and says why there is nothing to accept", async () => {
    const { screen, onAccept } = await open(modesCatalog);
    await press(screen, "{Enter}mm{Enter}");
    expect(screen.lines.at(1)).toContain(
      "= Default at terminal in ascii · equal to the base",
    );
    expect(screen.lines.at(2)).toContain("● badge");
    expect(screen.lines.at(-2)).toMatch(
      /^equal to the base picture, so it keeps no golden of its own +terminal · ascii$/,
    );
    await press(screen, "{Shift>}a{/Shift}");
    expect(screen.lines.at(-2)).toMatch(
      /^nothing to accept: the base picture's golden covers it +terminal/,
    );
    await press(screen, "{Escape}jjmm{Enter}");
    expect(screen.lines.at(1)).toContain(
      "! Quiet at terminal in dark · equal where a change was expected",
    );
    await press(screen, "{Shift>}a{/Shift}");
    expect(screen.lines.at(-2)).toMatch(
      /^nothing to accept: it draws the base picture, which dark should/,
    );
    expect(onAccept).not.toHaveBeenCalled();
  });

  it("accepts a mode's picture as that mode's golden, naming the mode", async () => {
    const { screen, onAccept } = await open(modesCatalog);
    await press(screen, "{Enter}jm{Enter}{Shift>}a{/Shift}");
    expect(screen.lines.at(-2)).toMatch(
      /^accept Loud at terminal in dark as its golden\? y accepts/,
    );
    await press(screen, "y");
    expect(onAccept).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Loud", mode: "dark" }),
    );
    expect(
      await screen.findByText("accepted Loud at terminal in dark"),
    ).toBeDefined();
  });

  it("says a story leaves a mode out when it is inspected there", async () => {
    const { screen } = await open(modesCatalog);
    await press(screen, "{Enter}jjmm{Enter}");
    expect(screen.lines.at(1)).toContain("Quiet at terminal in ascii");
    expect(screen.lines.at(2)).toContain(
      "This story's parameters.modes leaves ascii out.",
    );
  });

  it("lists the modes and the globals drawn under m in the help", async () => {
    const { screen } = await open(modesCatalog, { rows: 40 });
    const help = (await press(screen, "?")).join("\n");
    expect(help).toContain("m        show the next mode");
    expect(help).toContain("base: sets no global");
    expect(help).toContain("dark: sets scheme dark");
    expect(help).toContain(
      "globals drawn: scheme light, dark; glyphs unicode, ascii",
    );
  });

  it("opens the matrix on x, a row for each story and a column for each size and mode, every cell in its state", async () => {
    const { screen } = await open(modesCatalog);
    const matrix = await press(screen, "x");
    expect(matrix.at(1)).toMatch(/^┌─matrix · 5 stories in 6 columns─/);
    expect(matrix.slice(2, 9)).toEqual([
      "│                terminal          wide                                        │",
      "│story           base  dark  ascii base  dark  ascii                           │",
      "│▸ Badge Default [✓]    ✓     =     ✓     ✓     =                              │",
      "│  Badge Loud     ✓     ±     +     ✓     ±     +                              │",
      "│  Badge Quiet    ✓     !           ✓     !                                    │",
      "│  Badge Thrown   ✗     ✗     ✗     ✗     ✗     ✗                              │",
      "│  Card Default   ✓     =     ✓     ✓     =     ✓                              │",
    ]);
    expect(matrix.at(-2)).toMatch(
      /^Badge Default at terminal: pass +terminal · base$/,
    );
    expect(matrix.at(-1)).toMatch(/^↑↓ move ←→ column ⏎ open esc back x /);
    expect((await press(screen, "jjll")).at(-2)).toMatch(
      /^Badge Quiet at terminal in ascii: left out +terminal · ascii$/,
    );
    expect((await press(screen, "x")).at(1)).toContain("= Default");
  });

  it("moves over the matrix's cells, opens one, and comes back to the matrix with Esc, then out of it", async () => {
    const { screen } = await open(modesCatalog);
    await press(screen, "xkhjl");
    expect(screen.lines.at(-2)).toMatch(
      /^Badge Loud at terminal in dark: changed/,
    );
    await press(screen, "jjjjjlllllll");
    expect(screen.lines.at(-2)).toMatch(
      /^Card Default at wide in ascii: pass +wide · ascii$/,
    );
    await press(screen, "kkkhhhh{Enter}");
    expect(screen.lines.at(1)).toContain(
      "± Loud at terminal in dark · changed",
    );
    expect(screen.lines.at(2)).toContain("1 line differs");
    expect(screen.lines.at(-1)).toContain("esc back");
    const back = await press(screen, "{Escape}");
    expect(back.at(1)).toMatch(/^┌─matrix/);
    expect(back.at(5)).toContain("[±]");
    await press(screen, "j{Enter}");
    expect(screen.lines.at(1)).toContain("! Quiet at terminal in dark");
    expect(screen.lines.at(2)).toContain("The mode dark expects");
    await press(screen, "{Escape}{Escape}");
    expect(screen.lines.at(0)).toMatch(/^component\/Badge /);
    expect(screen.lines.at(1)).not.toContain("matrix");
  });

  it("comes back from a cell to the matrix scrolled as it was", async () => {
    const { screen } = await open(crowdedCatalog);
    await press(screen, `x${"j".repeat(18)}${"k".repeat(10)}`);
    const before = screen.lines.at(1);
    expect(before).toMatch(/ · stories (?!1–)\d+–\d+/);
    expect((await press(screen, "{Enter}{Escape}")).at(1)).toBe(before);
  });

  it("offers neither m nor x, in the key bar or the help, to a project with no modes", async () => {
    const { screen } = await open(sampleCatalog, { rows: 40 });
    expect(screen.lines.at(-1)).not.toMatch(/ [mx] /);
    const help = await press(screen, "?");
    expect(help.join("\n")).not.toContain("show the next mode");
    expect(help.join("\n")).not.toContain("matrix");
    await press(screen, "{Escape}xm");
    expect(screen.lines.at(1)).toContain("▸ ✓ Default");
  });
});
