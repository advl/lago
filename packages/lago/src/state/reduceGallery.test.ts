import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import { buildCatalog } from "../catalog/index.js";
import { openingState } from "./constants.js";
import reduceGallery from "./reduceGallery.js";
import type { GalleryAction, GalleryState } from "./types.js";

const catalog = buildCatalog([
  makeRecord("component/KeyBar", "Default"),
  makeRecord("component/KeyBar", "Long", {
    lines: ["a long bar", "with keys"],
    status: "changed",
  }),
  makeRecord("component/KeyBar", "Default", { viewportName: "wide" }),
  makeRecord("layout/Pane", "Empty"),
]);
const empty = buildCatalog([]);

/** The state after each of `actions` in turn, from `state`. */
const play = (state: GalleryState, ...actions: GalleryAction[]) =>
  actions.reduce((next, action) => reduceGallery(next, action, catalog), state);

const stories: GalleryState = {
  ...openingState,
  focus: "stories",
  title: "component/KeyBar",
};
const inspecting: GalleryState = { ...stories, inspecting: true };
const key = {
  title: "component/KeyBar",
  story: "Long",
  viewportName: "narrow",
  text: "a long bar\nwith keys",
};

describe("reduceGallery", () => {
  it("moves through the tree's components, stopping at either end", () => {
    const down = play(openingState, { type: "move", by: 1 });
    expect(down).toMatchObject({ title: "layout/Pane", story: 0 });
    expect(play(down, { type: "move", by: 1 })).toBe(down);
    expect(play(down, { type: "move", by: -5 }).title).toBe("component/KeyBar");
    expect(play(openingState, { type: "move", by: -1 })).toBe(openingState);
    expect(play(openingState, { type: "moveAcross", by: 1 })).toBe(
      openingState,
    );
  });

  it("opens the selected component's stories, then the selected story inspected", () => {
    const opened = play(openingState, { type: "open" });
    expect(opened).toMatchObject({
      focus: "stories",
      title: "component/KeyBar",
    });
    expect(play(opened, { type: "open" }).inspecting).toBe(true);
    expect(reduceGallery(openingState, { type: "open" }, empty)).toBe(
      openingState,
    );
  });

  it("moves through the stories up and down or across, stopping at either end", () => {
    const second = play(stories, { type: "move", by: 1 });
    expect(second.story).toBe(1);
    expect(play(second, { type: "move", by: 1 })).toBe(second);
    expect(play(second, { type: "moveAcross", by: -1 }).story).toBe(0);
    const gone = { ...stories, title: "component/Gone" };
    expect(reduceGallery(gone, { type: "move", by: 1 }, empty)).toBe(gone);
  });

  it("scrolls an inspected picture, or moves its cursor once shown, never above or left of its corner", () => {
    expect(
      play(inspecting, { type: "move", by: 3 }, { type: "move", by: -1 })
        .scroll,
    ).toBe(2);
    expect(play(inspecting, { type: "move", by: -1 }).scroll).toBe(0);
    expect(play(inspecting, { type: "moveAcross", by: 1 })).toBe(inspecting);
    const cell = play(
      inspecting,
      { type: "toggleCell" },
      { type: "move", by: 2 },
      {
        type: "moveAcross",
        by: 3,
      },
    );
    expect(cell.cell).toEqual({ x: 3, y: 2 });
    expect(
      play(cell, { type: "move", by: -5 }, { type: "moveAcross", by: -5 }).cell,
    ).toEqual({
      x: 0,
      y: 0,
    });
    expect(play(cell, { type: "toggleCell" }).cell).toBeUndefined();
  });

  it("shows the difference, the cursor and the question to accept only on an inspected story", () => {
    expect(play(inspecting, { type: "toggleDifference" }).difference).toBe(
      true,
    );
    const long = { ...inspecting, story: 1 };
    expect(play(long, { type: "askAccept" }).confirming).toEqual(key);
    expect(
      play(long, { type: "askAccept" }, { type: "cancel" }).confirming,
    ).toBeUndefined();
    expect(play(inspecting, { type: "askAccept" })).toBe(inspecting);
    for (const type of [
      "toggleDifference",
      "toggleCell",
      "askAccept",
    ] as const) {
      expect(play(stories, { type })).toBe(stories);
    }
  });

  it("sets an open story back when another story or component is selected", () => {
    const open = { ...stories, difference: true, scroll: 4, confirming: key };
    expect(play(open, { type: "move", by: 1 })).toMatchObject({
      story: 1,
      scroll: 0,
      difference: false,
      confirming: undefined,
    });
  });

  it("comes out one step at a time with Esc, from the help to the tree", () => {
    const steps: GalleryState[] = [
      {
        ...inspecting,
        help: true,
        confirming: key,
        searching: true,
        search: "x",
        cell: { x: 1, y: 1 },
        difference: true,
      },
    ];
    for (let step = 0; step < 8; step += 1) {
      steps.push(play(steps.at(-1) ?? openingState, { type: "back" }));
    }
    expect(
      steps.map(
        ({
          help,
          confirming,
          searching,
          search,
          cell,
          difference,
          inspecting,
          focus,
        }) => [
          help,
          Boolean(confirming),
          searching && search,
          Boolean(cell),
          difference,
          inspecting,
          focus,
        ],
      ),
    ).toEqual([
      [true, true, "x", true, true, true, "stories"],
      [false, true, "x", true, true, true, "stories"],
      [false, false, "x", true, true, true, "stories"],
      [false, false, false, true, true, true, "stories"],
      [false, false, false, false, true, true, "stories"],
      [false, false, false, false, false, true, "stories"],
      [false, false, false, false, false, false, "stories"],
      [false, false, false, false, false, false, "tree"],
      [false, false, false, false, false, false, "tree"],
    ]);
    expect(steps.at(-1)).toBe(steps.at(-2));
    expect(
      play(
        { ...openingState, filtering: true, filter: "ke" },
        { type: "back" },
      ),
    ).toMatchObject({
      filtering: false,
      filter: "",
    });
  });

  it("types the filter on the tree, ignoring every other key until it is finished", () => {
    const typed = play(
      stories,
      { type: "startFilter" },
      { type: "type", text: "pa" },
      { type: "type", text: "x" },
      { type: "erase" },
    );
    expect(typed).toMatchObject({
      focus: "tree",
      filtering: true,
      filter: "pa",
    });
    expect(play(typed, { type: "move", by: 1 })).toBe(typed);
    expect(play(typed, { type: "finish" })).toMatchObject({
      filtering: false,
      filter: "pa",
    });
    expect(play(openingState, { type: "type", text: "x" })).toBe(openingState);
    expect(play(openingState, { type: "erase" })).toBe(openingState);
  });

  it("goes to the search's first hit once it is typed, and steps through the hits round", () => {
    const found = play(
      stories,
      { type: "startSearch" },
      { type: "type", text: "long" },
      { type: "finish" },
    );
    expect(found).toMatchObject({
      searching: false,
      search: "long",
      story: 1,
      hit: 0,
    });
    const inspected = { ...found, inspecting: true };
    expect(play(inspected, { type: "nextHit", by: 1 })).toMatchObject({
      hit: 1,
      inspecting: true,
    });
    expect(play(inspected, { type: "nextHit", by: -1 }).hit).toBe(1);
    expect(play(inspected, { type: "nextHit", by: 2 }).hit).toBe(0);
  });

  it("sets the open story back when a hit is in another story, and stays put when nothing is found", () => {
    const searched = { ...inspecting, search: "e" };
    expect(play(searched, { type: "nextHit", by: 2 })).toMatchObject({
      story: 1,
      hit: 2,
      inspecting: false,
    });
    const missed = play(
      stories,
      { type: "startSearch" },
      { type: "type", text: "zz" },
      {
        type: "finish",
      },
    );
    expect(missed).toMatchObject({ searching: false, story: 0, hit: 0 });
  });

  it("steps through the viewports and the arrangements round, and opens and closes the help", () => {
    const wide = play(
      { ...inspecting, scroll: 3, cell: { x: 1, y: 1 } },
      { type: "nextViewport" },
    );
    expect(wide).toMatchObject({ viewport: 1, scroll: 0, cell: undefined });
    expect(play(wide, { type: "nextViewport" }).viewport).toBe(0);
    expect(
      reduceGallery(openingState, { type: "nextViewport" }, empty).viewport,
    ).toBe(0);
    const arranged: string[] = [];
    let state = openingState;
    for (let step = 0; step < 3; step += 1) {
      state = play(state, { type: "nextArrangement" });
      arranged.push(state.arrangement);
    }
    expect(arranged).toEqual(["rows", "beside", "auto"]);
    expect(play(openingState, { type: "toggleHelp" }).help).toBe(true);
    expect(
      play(openingState, { type: "toggleHelp" }, { type: "toggleHelp" }).help,
    ).toBe(false);
  });
  it("leaves the inspected story when the filter starts, so the filter cannot leave it open on another component", () => {
    const open = { ...inspecting, story: 1, difference: true };
    expect(play(open, { type: "startFilter" })).toMatchObject({
      focus: "tree",
      filtering: true,
      inspecting: false,
      difference: false,
    });
  });

  it("opens nothing and asks nothing when no component is selected", () => {
    expect(reduceGallery(stories, { type: "open" }, empty)).toBe(stories);
    expect(reduceGallery(inspecting, { type: "askAccept" }, empty)).toBe(
      inspecting,
    );
  });

  it("keeps the component a search's hit is in, whatever a later run puts first", () => {
    const found = play(
      openingState,
      { type: "startSearch" },
      { type: "type", text: "long" },
      { type: "finish" },
    );
    expect(found).toMatchObject({
      focus: "stories",
      title: "component/KeyBar",
    });
  });

  it("starts the hits again at another viewport, where they differ", () => {
    const searched = { ...stories, search: "e", hit: 2 };
    expect(play(searched, { type: "nextViewport" }).hit).toBe(0);
  });
  it("holds the scroll and the cursor within the limits the screen gives", () => {
    const scrolled = play(inspecting, { type: "move", by: 9, limit: 4 });
    expect(scrolled.scroll).toBe(4);
    expect(
      play({ ...inspecting, scroll: 20 }, { type: "move", by: -1, limit: 4 })
        .scroll,
    ).toBe(3);
    const cell = { ...inspecting, cell: { x: 0, y: 0 } };
    expect(
      play(
        cell,
        { type: "move", by: 9, limit: 2 },
        { type: "moveAcross", by: 9, limit: 5 },
      ).cell,
    ).toEqual({ x: 5, y: 2 });
  });
});
