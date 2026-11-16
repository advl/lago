import { describe, expect, it, vi } from "vitest";
import type { Screenshot } from "../screenshot/index.js";
import createScreen from "./createScreen.js";
import type { Press, ScreenParts } from "./types.js";

const picture = (text: string): Screenshot => ({
  cols: 10,
  rows: 1,
  lines: [
    [
      {
        x: 0,
        text,
        width: text.length,
        fg: "default",
        bg: "default",
        attributes: [],
      },
    ],
  ],
});

/** Parts that record what the screen asked of them, in order. */
function recordParts(shows: () => Screenshot = () => picture("ready")) {
  const calls: string[] = [];
  const parts: ScreenParts = {
    capture: shows,
    settle: vi.fn(async () => {
      calls.push("settle");
    }),
    press: vi.fn(async ({ key }: Press) => {
      calls.push(`press ${key}`);
    }),
    paste: vi.fn(async (text: string) => {
      calls.push(`paste ${text}`);
    }),
    close: vi.fn(async () => {
      calls.push("close");
    }),
  };
  return { calls, parts };
}

describe("createScreen", () => {
  it("reads what the renderer's screen shows, as lines and as runs", () => {
    const screen = createScreen(recordParts().parts);
    expect(screen.lines).toEqual(["ready"]);
    expect(screen.getByText("ead")).toMatchObject({ text: "ready", x: 0 });
    expect(screen.screenshot()).toEqual(picture("ready"));
  });

  it("presses each key, and settles after each before the next", async () => {
    const { calls, parts } = recordParts();
    await createScreen(parts).userEvent.keyboard("a{Enter}");
    expect(calls).toEqual(["press a", "settle", "press Enter", "settle"]);
    expect(parts.press).toHaveBeenCalledWith({
      named: true,
      key: "Enter",
      modifiers: {},
    });
  });

  it("refuses a key it does not know before pressing anything", async () => {
    const { calls, parts } = recordParts();
    await expect(
      createScreen(parts).userEvent.keyboard("a{Nope}"),
    ).rejects.toThrow("{Nope} is not a key");
    expect(calls).toEqual([]);
  });

  it("pastes in one piece, then settles", async () => {
    const { calls, parts } = recordParts();
    await createScreen(parts).userEvent.paste("two words");
    expect(calls).toEqual(["paste two words", "settle"]);
  });

  it("finds text once it appears, settling between tries", async () => {
    let shown = "loading";
    const { parts } = recordParts(() => picture(shown));
    let settles = 0;
    const screen = createScreen({
      ...parts,
      settle: async () => {
        settles += 1;
        if (settles === 3) shown = "done";
      },
    });
    await expect(screen.findByText("done")).resolves.toMatchObject({
      text: "done",
    });
    expect(settles).toBe(3);
  });

  it("closes the renderer once, however often it is unmounted", async () => {
    const { calls, parts } = recordParts();
    const screen = createScreen(parts);
    await screen.unmount();
    await screen.unmount();
    expect(calls).toEqual(["close"]);
  });

  it("refuses to be read once unmounted, saying why", async () => {
    const screen = createScreen(recordParts().parts);
    await screen.unmount();
    expect(() => screen.lines).toThrow(
      "The screen was unmounted, as every screen is when its test ends.",
    );
  });
});
