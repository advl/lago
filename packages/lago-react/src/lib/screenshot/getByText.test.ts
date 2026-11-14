import { describe, expect, it } from "vitest";
import getByText from "./getByText.js";
import type { Screenshot } from "./types.js";

const plain = { fg: "default", bg: "default", attributes: [] } as const;
const screenshot: Screenshot = {
  cols: 20,
  rows: 3,
  lines: [
    [{ ...plain, x: 0, text: "Inbox", width: 5, attributes: ["bold"] }],
    [
      { ...plain, x: 0, text: "1d", width: 2, fg: 1 },
      { ...plain, x: 2, text: " over", width: 5, fg: 3 },
    ],
    [{ ...plain, x: 4, text: "1d left", width: 7, fg: 2 }],
  ],
};

describe("getByText", () => {
  it("gives the first run that contains the text, reading down the screen", () => {
    expect(getByText(screenshot, "1d")).toMatchObject({ x: 0, fg: 1 });
    expect(getByText(screenshot, "left")).toMatchObject({ x: 4, fg: 2 });
    expect(getByText(screenshot, "Inbox").attributes).toEqual(["bold"]);
  });

  it("says so, and shows the screen, when the text is nowhere", () => {
    expect(() => getByText(screenshot, "absent")).toThrow(
      'No text on the screen contains "absent".\nThe screen shows:\n|Inbox\n|1d over\n|    1d left',
    );
  });

  it("says where the text is when its style changes part way", () => {
    expect(() => getByText(screenshot, "1d over")).toThrow(
      '"1d over" is on line 2, but its style changes part way',
    );
  });
});
