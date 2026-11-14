import { describe, expect, it, vi } from "vitest";
import Broken from "../../../testing/Broken.js";
import Countdown from "../../../testing/Countdown.js";
import Keys from "../../../testing/Keys.js";
import Late from "../../../testing/Late.js";
import Tally from "../../../testing/Tally.js";
import render from "./render.js";
import type { Screen } from "./types.js";

describe("render", () => {
  it("mounts a component on a screen of the size asked for", async () => {
    const screen = await render(<text>hello</text>, { cols: 12, rows: 3 });
    expect(screen.lines).toEqual(["hello", "", ""]);
    expect(screen.screenshot()).toMatchObject({ cols: 12, rows: 3 });
  });

  it("mounts on 80 columns and 24 lines when no size is asked for", async () => {
    const screen = await render(<text>hello</text>);
    expect(screen.screenshot()).toMatchObject({ cols: 80, rows: 24 });
  });

  it("retries a component that suspends on its first render", async () => {
    const { promise, resolve } = Promise.withResolvers<string>();
    const screen = await render(<Late value={promise} />);
    expect(screen.lines.at(0)).toBe("loading");
    resolve("ready");
    await screen.settle();
    expect(screen.lines.at(0)).toBe("ready");
  });

  it("finds text that appears only after a while", async () => {
    const { promise, resolve } = Promise.withResolvers<string>();
    const screen = await render(<Late value={promise} />);
    setTimeout(() => resolve("ready"), 50);
    expect(await screen.findByText("ready")).toMatchObject({ x: 0 });
  });

  it("finds a run by its text, with its style", async () => {
    const screen = await render(
      <text fg="#00ff00">
        saved <b>now</b>
      </text>,
    );
    expect(screen.getByText("now")).toEqual({
      x: 6,
      text: "now",
      width: 3,
      fg: "#00ff00",
      bg: "default",
      attributes: ["bold"],
    });
    expect(() => screen.getByText("later")).toThrow(
      'No text on the screen contains "later".\nThe screen shows:\n|saved now',
    );
  });

  it("has a screenshot saved by vitest's snapshots as a golden's text", async () => {
    const screen = await render(
      <text fg="#00ff00">
        saved <b>now</b>
      </text>,
      { cols: 12, rows: 2 },
    );
    expect(screen.screenshot()).toMatchInlineSnapshot(`
      12x2
      |saved now

      1:1 "saved" fg=#00ff00
      1:7 "now" fg=#00ff00 bold
    `);
    expect({
      cols: 1,
      rows: 1,
      lines: "not a screenshot",
    }).toMatchInlineSnapshot(`
      {
        "cols": 1,
        "lines": "not a screenshot",
        "rows": 1,
      }
    `);
  });

  it("presses keys in the order they are written, each on the screen the last one drew", async () => {
    const screen = await render(<Keys />);
    await screen.userEvent.keyboard(
      "a{Enter}{Control>}c{/Control}{Shift>}{Tab}{/Shift}{ArrowDown}{PageDown}",
    );
    expect(screen.lines.slice(0, 7)).toEqual([
      "keys",
      "a",
      "return",
      "ctrl+c",
      "shift+tab",
      "down",
      "pagedown",
    ]);
  });

  it("sends a lone Escape at once, even while time is stopped", async () => {
    vi.useFakeTimers();
    const screen = await render(<Keys />);
    await screen.userEvent.keyboard("{Escape}");
    expect(screen.lines.at(1)).toBe("escape");
    await screen.userEvent.keyboard("{Escape}a");
    expect(screen.lines.slice(2, 4)).toEqual(["escape", "a"]);
    vi.useRealTimers();
  });

  it("sends every held modifier with the key it is held with", async () => {
    const screen = await render(<Keys />);
    await screen.userEvent.keyboard(
      "{Shift>}{Enter}{/Shift}{Control>}{F1}{/Control}{Control>}{Shift>}a{/Shift}{/Control}{Meta>}k{/Meta}{Alt>}{Backspace}{/Alt}",
    );
    expect(screen.lines.slice(1, 6)).toEqual([
      "shift+return",
      "ctrl+f1",
      "ctrl+shift+a",
      "super+k",
      "meta+backspace",
    ]);
  });

  it("fails with what the component throws as it draws, rather than drawing it", async () => {
    await expect(render(<Broken when="drawing" />)).rejects.toThrow(
      "cannot draw this",
    );
  });

  it("fails with what the component throws in an effect", async () => {
    await expect(render(<Broken when="effect" />)).rejects.toThrow(
      "cannot finish this",
    );
  });

  it("shows what a timer did once moved and settled, with no warning from React", async () => {
    const warned = vi.spyOn(console, "error");
    vi.useFakeTimers();
    const screen = await render(<Countdown />);
    vi.advanceTimersByTime(1_000);
    await screen.settle();
    expect(screen.lines.at(0)).toBe("done");
    expect(warned).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("presses each key on the screen the key before it drew", async () => {
    const screen = await render(<Tally />);
    await screen.userEvent.keyboard("+++");
    expect(screen.lines.at(0)).toBe("count 3");
  });

  it("pastes text in one piece", async () => {
    const screen = await render(<Keys />);
    await screen.userEvent.paste("two words");
    expect(screen.lines.at(1)).toBe("pasted two words");
  });

  // These tests read across a test's end, so they run in the order written.
  describe("when a test ends", { shuffle: false }, () => {
    let earlier: Screen;

    it("holds a screen while its test runs", async () => {
      earlier = await render(<text>held</text>);
      expect(earlier.lines.at(0)).toBe("held");
    });

    it("has unmounted the screens of the test before, which then say so", () => {
      expect(() => earlier.lines).toThrow(
        "The screen was unmounted, as every screen is when its test ends.",
      );
    });
  });

  it("unmounts when asked, once", async () => {
    const screen = await render(<text>held</text>);
    await screen.unmount();
    await screen.unmount();
    expect(() => screen.screenshot()).toThrow("The screen was unmounted");
  });
});
