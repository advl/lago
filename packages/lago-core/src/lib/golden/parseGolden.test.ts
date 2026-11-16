import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { measureLine, reportedLine } from "../../../testing/arbitraries.js";
import { normalizeRuns } from "../screenshot/index.js";
import formatGolden from "./formatGolden.js";
import parseGolden from "./parseGolden.js";

const golden = [
  "20x3",
  "|ab  cd",
  "",
  '1:1 "ab" fg=1 bold',
  '1:5 "cd" bg=#102030',
  "",
].join("\n");

/** The golden with one of its lines replaced, or a line added at the end. */
const change = (line: number, text: string) =>
  golden
    .split("\n")
    .toSpliced(line - 1, text === "" ? 0 : 1, text)
    .join("\n");

describe("parseGolden", () => {
  it("reads the runs a golden holds", () => {
    expect(parseGolden(golden)).toEqual({
      cols: 20,
      rows: 3,
      lines: [
        [
          {
            x: 0,
            text: "ab",
            width: 2,
            fg: 1,
            bg: "default",
            attributes: ["bold"],
          },
          {
            x: 4,
            text: "cd",
            width: 2,
            fg: "default",
            bg: "#102030",
            attributes: [],
          },
        ],
        [],
        [],
      ],
    });
  });

  it("reads back every screenshot that formatGolden writes, a run at the right edge included", () => {
    fc.assert(
      fc.property(fc.array(reportedLine, { maxLength: 4 }), (reported) => {
        const lines = reported.map(normalizeRuns);
        // As narrow as the widest line, so that line ends at the edge.
        const cols = Math.max(1, ...lines.map(measureLine));
        const screenshot = { cols, rows: lines.length, lines };
        expect(parseGolden(formatGolden(screenshot))).toEqual(screenshot);
      }),
    );
  });

  it("reads a width that is not one column per character", () => {
    const wide = '6x1\n|日本\n\n1:1 "日本" w=4\n';
    expect(parseGolden(wide).lines.at(0)).toMatchObject([{ width: 4 }]);
  });

  it("refuses a file that does not open with its size", () => {
    expect(() => parseGolden("forty columns\n")).toThrow(
      'A golden opens with its size, such as 40x36, and this one opens with "forty columns".',
    );
  });

  it("refuses a picture that its runs do not give, by the line that differs", () => {
    expect(() => parseGolden(change(2, "|ab  ce"))).toThrow(
      'Line 2 of the golden is not what its runs give.\n  the file has:  "|ab  ce"\n  the runs give: "|ab  cd"',
    );
  });

  it("refuses a file that ends early or runs on", () => {
    expect(() => parseGolden(golden.trimEnd())).toThrow(
      'Line 6 of the golden is not what its runs give.\n  the file has:  "no such line"',
    );
    expect(() => parseGolden(`${golden}\n`)).toThrow(
      'Line 7 of the golden is not what its runs give.\n  the file has:  ""\n  the runs give: "no such line"',
    );
  });

  it("refuses attributes out of their order, since the file would not be the one written", () => {
    expect(() => parseGolden(change(4, '1:1 "ab" bold fg=1'))).toThrow(
      "Line 4 of the golden is not what its runs give.",
    );
  });

  it.each([
    [
      "a line that is not a run",
      "one:1 ab",
      "Line 4 of the golden is not a run",
    ],
    [
      "text that cannot be read",
      '1:1 "a\\x"',
      "Line 4 of the golden quotes text that cannot be read",
    ],
    [
      "a palette entry past 255",
      '1:1 "ab" fg=256',
      "Line 4 of the golden gives the colour 256",
    ],
    [
      "a colour in another notation",
      '1:1 "ab" bg=red',
      "Line 4 of the golden gives the colour red",
    ],
    [
      "a word that is no style",
      '1:1 "ab" loud',
      "Line 4 of the golden has the word loud",
    ],
    [
      "a run below the screen",
      '4:1 "ab"',
      "Line 4 of the golden places a run off the screen",
    ],
    [
      "a run past the right edge",
      '1:20 "ab"',
      "Line 4 of the golden places a run off the screen",
    ],
  ])("refuses %s", (_, line, message) => {
    expect(() => parseGolden(change(4, line))).toThrow(message);
  });

  it("refuses a run that starts before the end of the one above it", () => {
    expect(() => parseGolden(change(5, '1:2 "cd"'))).toThrow(
      "Line 5 of the golden places a run off the screen or before the end of the run above it",
    );
  });
});
