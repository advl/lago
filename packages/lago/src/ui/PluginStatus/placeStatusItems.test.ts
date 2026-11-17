import { describe, expect, it } from "vitest";
import placeStatusItems from "./placeStatusItems.js";

const selection = {
  title: "component/KeyBar",
  story: undefined,
  viewportName: "wide",
  mode: undefined,
  palette: "dracula",
};

const component = () => null;

describe("placeStatusItems", () => {
  it("places each text at its measure and each component at its columns, each after a separator", () => {
    expect(
      placeStatusItems(
        [
          { text: ({ palette }) => `palette ${palette}` },
          { columns: 6, component },
        ],
        selection,
        80,
      ),
    ).toEqual({
      items: [
        { text: "palette dracula", columns: 15 },
        { component, columns: 6 },
      ],
      columns: 27,
    });
  });

  it("keeps the items within half the line, leaving out the first that would pass it and all after", () => {
    const placed = placeStatusItems(
      [{ text: () => "grid" }, { columns: 30, component }, { text: () => "x" }],
      selection,
      40,
    );
    expect(placed).toEqual({
      items: [{ text: "grid", columns: 4 }],
      columns: 7,
    });
    expect(placeStatusItems([], selection, 40)).toEqual({
      items: [],
      columns: 0,
    });
  });

  it("fits a text longer than the room to it, and then leaves it out with its separator", () => {
    const placed = placeStatusItems(
      [{ text: () => "a text far longer than half of a narrow line" }],
      selection,
      20,
    );
    expect(placed.items).toEqual([]);
  });
});
