import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import { keysPicture, tallPicture } from "../../../testing/pictures.js";
import Picture from "./Picture.js";

describe("Picture", () => {
  it("draws a picture again as the story drew it: its text, colours and attributes", async () => {
    const screen = await render(
      <Picture picture={keysPicture} lines={5} cols={40} />,
      {
        cols: 40,
        rows: 5,
      },
    );
    expect(screen.screenshot()).toEqual(keysPicture);
  });

  it("draws the lines from the one asked for, cut at the columns given", async () => {
    const screen = await render(
      <Picture picture={tallPicture} from={10} lines={3} cols={6} />,
      {
        cols: 20,
        rows: 4,
      },
    );
    expect(screen.lines).toEqual(["line 1", "line 1", "line 1", ""]);
  });

  it("inverts the cursor's cell, and draws an inverted cell the cursor is on as it was asked for", async () => {
    const screen = await render(
      <Picture
        picture={keysPicture}
        lines={5}
        cols={40}
        cell={{ x: 1, y: 3 }}
      />,
      { cols: 40, rows: 5 },
    );
    const line = screen.screenshot().lines.at(3) ?? [];
    expect(line.map(({ text, attributes }) => [text, attributes])).toEqual([
      [" ", ["inverse"]],
      ["s", []],
      ["elected row ", ["inverse"]],
    ]);
    expect(line.at(1)).toMatchObject({ fg: 2, bg: "default" });
  });

  it("draws blank lines past the picture's last", async () => {
    const screen = await render(
      <Picture picture={keysPicture} from={4} lines={3} cols={40} />,
      {
        cols: 40,
        rows: 3,
      },
    );
    expect(screen.lines).toEqual(["underlined", "", ""]);
  });
});
