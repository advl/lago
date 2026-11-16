import { describe, expect, it } from "vitest";
import type { Screenshot } from "../screenshot/index.js";
import registerSerializer from "./registerSerializer.js";

const screenshot: Screenshot = {
  cols: 6,
  rows: 1,
  lines: [
    [
      {
        x: 0,
        text: "hi",
        width: 2,
        fg: 1,
        bg: "default",
        attributes: ["bold"],
      },
    ],
  ],
};

describe("registerSerializer", () => {
  it("makes a snapshot of a screenshot its golden's text, once however often it is called", () => {
    registerSerializer();
    registerSerializer();
    expect(screenshot).toMatchInlineSnapshot(`
      6x1
      |hi

      1:1 "hi" fg=1 bold
    `);
  });

  it("leaves other values to vitest's own serializers", () => {
    registerSerializer();
    expect({ cols: 1 }).toMatchInlineSnapshot(`
      {
        "cols": 1,
      }
    `);
  });
});
