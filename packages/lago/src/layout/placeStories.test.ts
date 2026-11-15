import { describe, expect, it } from "vitest";
import placeStories from "./placeStories.js";

const stories = [
  {
    name: "First",
    description: "The first, with a description long enough to wrap.",
    extent: { cols: 20, rows: 3 },
  },
  { name: "Second", description: undefined, extent: { cols: 20, rows: 30 } },
  { name: "Third", description: "Short.", extent: { cols: 60, rows: 1 } },
];

describe("placeStories", () => {
  it("pairs the stories beside each other, each block as tall as its taller frame, a tall picture cut", () => {
    expect(placeStories(stories, "beside", 80)).toEqual([
      {
        key: "First Second",
        stories: stories.slice(0, 2),
        lines: 14,
        description: [],
        under: false,
      },
      {
        key: "Third",
        stories: stories.slice(2),
        lines: 3,
        description: [],
        under: false,
      },
    ]);
  });

  it("gives each story a row with its description wrapped beside its picture", () => {
    // 60 columns less the 22 of the frame and the 2 of the gutter leave 36.
    const [first, second] = placeStories(stories, "rows", 60);
    expect(first).toEqual({
      key: "First",
      stories: stories.slice(0, 1),
      lines: 5,
      description: ["The first, with a description long", "enough to wrap."],
      under: false,
    });
    expect(second).toMatchObject({ lines: 14, description: [] });
  });

  it("puts the description under a picture that leaves it too little room beside", () => {
    const third = placeStories(stories, "rows", 70).at(2);
    expect(third).toEqual({
      key: "Third",
      stories: stories.slice(2),
      lines: 4,
      description: ["Short."],
      under: true,
    });
  });
  it("keeps a description beside its picture while exactly the fewest columns remain", () => {
    const story = {
      name: "Edge",
      description: "twenty columns of it",
      extent: { cols: 40, rows: 1 },
    };
    // 64 columns less the 42 of the frame and the 2 of the gutter leave 20.
    expect(placeStories([story], "rows", 64).at(0)).toMatchObject({
      under: false,
      description: ["twenty columns of it"],
    });
    expect(placeStories([story], "rows", 63).at(0)?.under).toBe(true);
  });
});
