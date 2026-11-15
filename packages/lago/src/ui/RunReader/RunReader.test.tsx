import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import { keysPicture } from "../../../testing/pictures.js";
import RunReader from "./RunReader.js";

describe("RunReader", () => {
  it("states what is drawn under the cursor, cut to the pane's width", async () => {
    const wide = await render(
      <RunReader picture={keysPicture} cell={{ x: 3, y: 0 }} width={80} />,
      {
        cols: 80,
        rows: 1,
      },
    );
    expect(wide.lines).toEqual([
      "column 4, line 1: “move” · fg palette 7 · bg the terminal's own",
    ]);
    const narrow = await render(
      <RunReader picture={keysPicture} cell={{ x: 3, y: 0 }} width={30} />,
      {
        cols: 30,
        rows: 1,
      },
    );
    expect(narrow.lines).toEqual(["column 4, line 1: “move” · fg…"]);
  });
});
