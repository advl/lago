import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { measureLine, reportedLine } from "../../../testing/arbitraries.js";
import normalizeRuns from "./normalizeRuns.js";
import readLines from "./readLines.js";
import type { Run } from "./types.js";

const plain = { fg: "default", bg: "default", attributes: [] } as const;

/** Runs one after another from column 0, each one column per character. */
function follow(...pieces: (Partial<Run> & { text: string })[]): Run[] {
  let column = 0;
  return pieces.map((piece) => {
    const run = { ...plain, x: column, width: piece.text.length, ...piece };
    column = run.x + run.width;
    return run;
  });
}

describe("normalizeRuns", () => {
  it("drops the colour and the weight of a space, which cannot be seen", () => {
    const line = follow(
      { text: "a", fg: 1 },
      { text: " ", fg: 2, attributes: ["bold"] },
      { text: "b", fg: 1 },
    );
    expect(normalizeRuns(line)).toEqual(follow({ text: "a b", fg: 1 }));
  });

  it("gives the same runs however the spaces between words were coloured", () => {
    const whole = follow({ text: "Fix the parser", fg: 7 });
    const pieces = follow(
      { text: "Fix", fg: 7 },
      { text: " ", fg: 3 },
      { text: "the", fg: 7 },
      { text: " ", attributes: ["italic"] },
      { text: "parser", fg: 7 },
    );
    expect(normalizeRuns(pieces)).toEqual(normalizeRuns(whole));
  });

  it("splits where the style changes and nowhere else", () => {
    const line = follow(
      { text: "one", fg: 1 },
      { text: "two", fg: 1 },
      { text: "three", fg: 1, attributes: ["bold"] },
    );
    expect(normalizeRuns(line)).toEqual(
      follow(
        { text: "onetwo", fg: 1 },
        { text: "three", fg: 1, attributes: ["bold"] },
      ),
    );
  });

  it("leaves out the spaces that end a run on the terminal's own background", () => {
    const line = follow({ text: "  title   ", fg: 4 });
    expect(normalizeRuns(line)).toEqual([
      { ...plain, x: 2, text: "title", width: 5, fg: 4 },
    ]);
  });

  it("leaves out a run of nothing but such spaces", () => {
    expect(normalizeRuns(follow({ text: "    ", fg: 4 }))).toEqual([]);
  });

  it("keeps the spaces of a background, joined to the text on it", () => {
    const line = follow(
      { text: "  ", bg: 8, fg: 2 },
      { text: "row", bg: 8, fg: 1 },
      { text: "   ", bg: 8, fg: 3 },
      { text: "  ", fg: 3 },
    );
    expect(normalizeRuns(line)).toEqual(
      follow({ text: "  row   ", bg: 8, fg: 1 }),
    );
  });

  it("keeps a background with no text on it, without a text colour", () => {
    const line = follow({ text: "    ", bg: 5, fg: 9, attributes: ["bold"] });
    expect(normalizeRuns(line)).toEqual(follow({ text: "    ", bg: 5 }));
  });

  it("joins a space to the run after it when the run before it has another background", () => {
    const line = follow(
      { text: "a", bg: 1 },
      { text: " ", bg: 2, fg: 7 },
      { text: "b", bg: 2, fg: 3 },
    );
    expect(normalizeRuns(line)).toEqual(
      follow({ text: "a", bg: 1 }, { text: " b", bg: 2, fg: 3 }),
    );
  });

  it("treats an underlined, struck or inverted space as text, because it shows", () => {
    for (const attribute of [
      "underline",
      "strikethrough",
      "inverse",
    ] as const) {
      const marked = { fg: 2, attributes: [attribute] };
      const line = follow(
        { text: "a", fg: 1 },
        { text: "  ", ...marked },
        { text: "b ", ...marked },
        { text: " ", fg: 3 },
        { text: "c", fg: 1 },
      );
      expect(normalizeRuns(line)).toEqual([
        { ...plain, x: 0, text: "a", width: 1, fg: 1 },
        { ...plain, x: 1, text: "  b ", width: 4, ...marked },
        { ...plain, x: 6, text: "c", width: 1, fg: 1 },
      ]);
    }
  });

  it("keeps the width the renderer measured when it cuts spaces away", () => {
    const line: Run[] = [{ ...plain, x: 0, text: " 日本  ", width: 7, fg: 1 }];
    expect(normalizeRuns(line)).toEqual([
      { ...plain, x: 1, text: "日本", width: 4, fg: 1 },
    ]);
  });

  it("reads a column no run covers as showing nothing", () => {
    const line: Run[] = [
      { ...plain, x: 2, text: "a", width: 1, fg: 1 },
      { ...plain, x: 5, text: "b", width: 1, fg: 1 },
      { ...plain, x: 8, text: "c", width: 1, fg: 2 },
    ];
    expect(normalizeRuns(line)).toEqual([
      { ...plain, x: 2, text: "a  b", width: 4, fg: 1 },
      { ...plain, x: 8, text: "c", width: 1, fg: 2 },
    ]);
  });

  it("changes nothing a reader sees", () => {
    fc.assert(
      fc.property(reportedLine, (line) => {
        const cols = measureLine(line);
        const before = { cols, rows: 1, lines: [line] };
        const after = { cols, rows: 1, lines: [normalizeRuns(line)] };
        expect(readLines(after)).toEqual(readLines(before));
      }),
    );
  });

  it("gives back its own result unchanged", () => {
    fc.assert(
      fc.property(reportedLine, (line) => {
        const once = normalizeRuns(line);
        expect(normalizeRuns(once)).toEqual(once);
      }),
    );
  });
});
