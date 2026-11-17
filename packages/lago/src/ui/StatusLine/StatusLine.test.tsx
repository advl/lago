import { render } from "@aztlan/lago-react";
import { describe, expect, it } from "vitest";
import { modesCatalog, sampleCatalog } from "../../../testing/catalogs.js";
import {
  type GalleryState,
  openingState,
  readSelection,
} from "../../state/index.js";
import StatusLine from "./StatusLine.js";

/** The status line for `state` on the sample catalog, at 80 columns. */
const draw = (state: GalleryState, message?: string, catalog = sampleCatalog) =>
  render(
    <StatusLine
      state={state}
      selection={readSelection(state, catalog)}
      catalog={catalog}
      message={message}
      width={80}
    />,
    { cols: 80, rows: 1 },
  ).then((screen) => screen.lines.at(0));

describe("StatusLine", () => {
  it("shows what is typed into the filter or the search, with a cursor", async () => {
    expect(await draw({ ...openingState, filtering: true, filter: "pa" })).toBe(
      "filter: pa▏",
    );
    expect(await draw({ ...openingState, searching: true, search: "mo" })).toBe(
      "search: mo▏",
    );
  });

  it("shows what the gallery last did before the search's matches and a failed file", async () => {
    expect(
      await draw(
        { ...openingState, search: "move" },
        "accepted Long at terminal",
      ),
    ).toBe("accepted Long at terminal");
    expect(await draw({ ...openingState, search: "move" })).toBe(
      "“move”: match 1 of 2",
    );
    expect(await draw(openingState)).toBe(
      "/project/src/Broken.stories.tsx: Cannot find module './Missing.js'",
    );
  });

  it("says the gallery is watching when nothing else is to say", async () => {
    expect(
      await draw(openingState, undefined, { ...sampleCatalog, failures: [] }),
    ).toBe("watching the stories for changes");
  });

  it("names its items after what it says, apart by dots, taking up to half the line", async () => {
    const drawWith = (items: readonly string[], cols = 80) =>
      render(
        <StatusLine
          state={openingState}
          selection={readSelection(openingState, sampleCatalog)}
          catalog={{ ...sampleCatalog, failures: [] }}
          message={undefined}
          items={items}
          width={cols}
        />,
        { cols, rows: 1 },
      ).then((screen) => screen.lines.at(0));
    expect(await drawWith(["narrow", "dark"])).toMatch(
      /^watching the stories for changes +narrow · dark$/,
    );
    expect(await drawWith(["narrow", "a mode with a very long name"], 40)).toBe(
      "watching the stori… narrow · a mode wit…",
    );
  });

  it("says an inspected mode's picture equal to the base keeps no golden", async () => {
    const state = {
      ...openingState,
      title: "component/Badge",
      mode: 2,
      inspecting: true,
    };
    const screen = await render(
      <StatusLine
        state={state}
        selection={readSelection(state, modesCatalog)}
        catalog={modesCatalog}
        message={undefined}
        width={80}
      />,
      { cols: 80, rows: 1 },
    );
    expect(screen.lines.at(0)).toBe(
      "equal to the base picture, so it keeps no golden of its own",
    );
  });
});
