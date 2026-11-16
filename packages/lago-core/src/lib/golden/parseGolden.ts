import {
  type Attribute,
  attributeNames,
  type Color,
  type Run,
  type Screenshot,
} from "../screenshot/index.js";
import formatGolden from "./formatGolden.js";

const sizeShape = /^(\d+)x(\d+)$/;
const runShape = /^(\d+):(\d+) ("(?:[^"\\]|\\.)*")((?: \S+)*)$/u;

function parseColor(word: string, line: number): Color {
  if (/^#[0-9a-f]{6}$/.test(word)) return word as `#${string}`;
  if (/^\d+$/.test(word) && Number(word) <= 255) return Number(word);
  throw new Error(
    `Line ${line} of the golden gives the colour ${word}, which is neither a palette entry from 0 to 255 nor a colour as #rrggbb.`,
  );
}

function parseText(quoted: string, line: number): string {
  try {
    return JSON.parse(quoted);
  } catch {
    throw new Error(
      `Line ${line} of the golden quotes text that cannot be read: ${quoted}`,
    );
  }
}

/** The run a line of the golden describes, and the line of the screen it is on. */
function parseRun(written: string, line: number): { row: number; run: Run } {
  const shape = runShape.exec(written);
  if (!shape) {
    throw new Error(
      `Line ${line} of the golden is not a run, such as 1:1 "text" fg=1 bold: ${written}`,
    );
  }
  const [, row, column, quoted, styles] = shape;
  const text = parseText(quoted, line);
  let width = [...text].length;
  let fg: Color = "default";
  let bg: Color = "default";
  const attributes = new Set<string>();
  for (const word of styles.split(" ").filter(Boolean)) {
    if (/^w=\d+$/.test(word)) width = Number(word.slice(2));
    else if (word.startsWith("fg=")) fg = parseColor(word.slice(3), line);
    else if (word.startsWith("bg=")) bg = parseColor(word.slice(3), line);
    else if (attributeNames.some((name) => name === word)) attributes.add(word);
    else {
      throw new Error(
        `Line ${line} of the golden has the word ${word}, which is neither a width, a colour nor an attribute.`,
      );
    }
  }
  return {
    row: Number(row) - 1,
    run: {
      x: Number(column) - 1,
      text,
      width,
      fg,
      bg,
      attributes: attributeNames.filter((name: Attribute) =>
        attributes.has(name),
      ),
    },
  };
}

/**
 * The screenshot a golden's text holds.
 *
 * Accepts exactly what `formatGolden` writes. The runs are read, and the text
 * they give is compared with the file: one whose picture and runs disagree,
 * or that is laid out in any other way, is refused by the first line that
 * differs.
 */
export default function parseGolden(text: string): Screenshot {
  const [header, ...body] = text.split("\n") as [string, ...string[]];
  const size = sizeShape.exec(header);
  if (!size) {
    throw new Error(
      `A golden opens with its size, such as 40x36, and this one opens with ${JSON.stringify(header)}.`,
    );
  }
  const [cols, rows] = size.slice(1).map(Number) as [number, number];
  const lines: Run[][] = Array.from({ length: rows }, () => []);
  for (const [index, written] of body.entries()) {
    if (written === "" || written.startsWith("|")) continue;
    const { row, run } = parseRun(written, index + 2);
    const line = lines.at(row);
    const last = line?.at(-1);
    const start = last ? last.x + last.width : 0;
    if (!line || run.x < start || run.x + run.width > cols) {
      throw new Error(
        `Line ${index + 2} of the golden places a run off the screen or before the end of the run above it: ${written}`,
      );
    }
    line.push(run);
  }
  const screenshot = { cols, rows, lines };
  const expected = formatGolden(screenshot);
  if (expected !== text) {
    const written = text.split("\n");
    const given = expected.split("\n");
    let at = 0;
    while (written.at(at) === given.at(at)) at += 1;
    throw new Error(
      [
        `Line ${at + 1} of the golden is not what its runs give.`,
        `  the file has:  ${JSON.stringify(written.at(at) ?? "no such line")}`,
        `  the runs give: ${JSON.stringify(given.at(at) ?? "no such line")}`,
      ].join("\n"),
    );
  }
  return screenshot;
}
