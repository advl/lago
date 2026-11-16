import {
  formatPicture,
  type Run,
  type Screenshot,
} from "../screenshot/index.js";

/**
 * A run on one line: where it starts, counted from 1 as an editor counts, its
 * text, then only what differs from plain text. The width is written when it
 * is not one column per character, as with a wide character.
 */
function formatRun(run: Run, row: number): string {
  const words = [`${row + 1}:${run.x + 1}`, JSON.stringify(run.text)];
  if (run.width !== [...run.text].length) words.push(`w=${run.width}`);
  if (run.fg !== "default") words.push(`fg=${run.fg}`);
  if (run.bg !== "default") words.push(`bg=${run.bg}`);
  return [...words, ...run.attributes].join(" ");
}

/**
 * A screenshot as the text a golden file holds: its size, the picture, an
 * empty line, then one line per run.
 *
 * The picture is for the eye and the runs are the data: a changed colour is a
 * changed line that quotes the text it belongs to.
 */
export default function formatGolden(screenshot: Screenshot): string {
  const runs = screenshot.lines.flatMap((line, row) =>
    line.map((run) => formatRun(run, row)),
  );
  return [
    `${screenshot.cols}x${screenshot.rows}`,
    ...formatPicture(screenshot),
    "",
    ...runs,
    "",
  ].join("\n");
}
