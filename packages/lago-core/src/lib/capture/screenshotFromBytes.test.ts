import { describe, expect, it, vi } from "vitest";
import screenshotFromBytes from "./screenshotFromBytes.js";

const viewport = { cols: 12, rows: 3 };

describe("screenshotFromBytes", () => {
  it("reads colours as they were asked for: a palette entry, a fixed colour, the terminal's own", async () => {
    const shot = await screenshotFromBytes(
      "\x1b[31mred\x1b[0m \x1b[38;2;255;136;0mhex\x1b[0m \x1b[44mon\x1b[0m",
      viewport,
    );
    expect(shot.lines.at(0)).toEqual([
      { x: 0, text: "red", width: 3, fg: 1, bg: "default", attributes: [] },
      {
        x: 4,
        text: "hex",
        width: 3,
        fg: "#ff8800",
        bg: "default",
        attributes: [],
      },
      { x: 8, text: "on", width: 2, fg: "default", bg: 4, attributes: [] },
    ]);
  });

  it("reads every attribute a run is drawn with, by its name", async () => {
    const shot = await screenshotFromBytes(
      "\x1b[1;2;3;4;5;8;9mx\x1b[0m",
      viewport,
    );
    expect(shot.lines.at(0)?.at(0)?.attributes).toEqual([
      "blink",
      "bold",
      "dim",
      "hidden",
      "italic",
      "strikethrough",
      "underline",
    ]);
  });

  it("gives an inverted run its two colours exchanged, the attribute kept", async () => {
    const shot = await screenshotFromBytes("\x1b[7;31;44mX\x1b[0m", viewport);
    expect(shot.lines.at(0)).toEqual([
      { x: 0, text: "X", width: 1, fg: 4, bg: 1, attributes: ["inverse"] },
    ]);
  });

  it("starts each written line at the left edge, as a terminal does with a newline", async () => {
    const shot = await screenshotFromBytes("one\ntwo\nthree", viewport);
    expect(shot.lines.map((line) => line.at(0)?.x)).toEqual([0, 0, 0]);
    expect(shot.lines.map((line) => line.at(0)?.text)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("measures a character by its grapheme cluster, so what follows an emoji is where a renderer puts it", async () => {
    const shot = await screenshotFromBytes("👍🏽|\n👨‍👩‍👧|\n日本|", viewport);
    expect(shot.lines.map((line) => line.at(0)?.width)).toEqual([3, 3, 5]);
  });

  it("refuses to wait on a timer a test has stopped, saying what to do instead", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    try {
      await expect(screenshotFromBytes("x", viewport)).rejects.toThrow(
        "setTimeout is faked, so it would never return. Put the real timers back with vi.useRealTimers() first",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("gives the screen it was asked for, lines nothing was written to empty", async () => {
    const shot = await screenshotFromBytes("", viewport);
    expect(shot).toEqual({ cols: 12, rows: 3, lines: [[], [], []] });
  });
});
