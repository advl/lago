import { afterAll, describe, expect, it } from "vitest";
import { renderStream } from "../src/lib/stream/index.js";
import { mountInk } from "./inkMount.js";

// A basic console, which the colour library would draw sixteen colours for
// unless the environment says otherwise. Nothing in this file imports Ink:
// the mount loads it, after renderStream has set the environment.
const termBefore = process.env.TERM;
process.env.TERM = "linux";
afterAll(() => {
  if (termBefore === undefined) delete process.env.TERM;
  else process.env.TERM = termBefore;
});

describe("a program drawn by Ink, through renderStream", () => {
  it("arrives with its colours as asked, a fixed colour exact in a basic console", async () => {
    const screen = await renderStream(
      mountInk(({ Colours }) => Colours),
      {
        cols: 20,
        rows: 2,
      },
    );
    expect(screen.screenshot().lines.at(0)).toEqual([
      { x: 0, text: "red", width: 3, fg: 1, bg: "default", attributes: [] },
      {
        x: 4,
        text: "hex",
        width: 3,
        fg: "#ff8800",
        bg: "default",
        attributes: [],
      },
      {
        x: 8,
        text: "inv",
        width: 3,
        fg: "default",
        bg: "default",
        attributes: ["inverse"],
      },
    ]);
  });

  it("is drawn as it is once its timer has run", async () => {
    const screen = await renderStream(mountInk(({ Later }) => Later));
    expect(screen.lines.at(0)).toBe("second");
  });

  it("reads keys a terminal sends, a lone Escape and modifiers included", async () => {
    const screen = await renderStream(mountInk(({ LastKey }) => LastKey));
    await screen.userEvent.keyboard("{ArrowUp}");
    expect(screen.lines.at(0)).toBe('"" upArrow');
    await screen.userEvent.keyboard("{Escape}");
    expect(screen.lines.at(0)).toBe('"" escape meta');
    await screen.userEvent.keyboard("{Control>}{ArrowRight}{/Control}");
    expect(screen.lines.at(0)).toBe('"" ctrl rightArrow');
    await screen.userEvent.keyboard("{Alt>}a{/Alt}");
    expect(screen.lines.at(0)).toBe('"a" meta');
  });

  it.each([
    ["{Enter}", '"\\r" return'],
    ["{Tab}", '"" tab'],
    ["{Shift>}{Tab}{/Shift}", '"" shift tab'],
    ["{Control>}a{/Control}", '"a" ctrl'],
    ["{PageDown}", '"" pageDown'],
    ["{Delete}", '"" delete'],
    ["{Shift>}{ArrowUp}{/Shift}", '"" shift upArrow'],
  ])("reads %s as the key a terminal sends for it", async (keys, seen) => {
    const screen = await renderStream(mountInk(({ LastKey }) => LastKey));
    await screen.userEvent.keyboard(keys);
    expect(screen.lines.at(0)).toBe(seen);
  });
});
