import fc from "fast-check";
import { attributeNames, type Run } from "../src/lib/screenshot/index.js";

const color = fc.oneof(
  fc.constant("default" as const),
  fc.integer({ min: 0, max: 255 }),
  fc.constantFrom("#000000" as const, "#ff8800" as const),
);

/** One character and the columns it takes: wide ones take two. */
const character = fc.constantFrom(
  ["a", 1],
  ["b", 1],
  [" ", 1],
  [" ", 1],
  ['"', 1],
  ["\\", 1],
  ["é", 1],
  ["日", 2],
) as fc.Arbitrary<[string, number]>;

const text = fc
  .array(character, { minLength: 1, maxLength: 6 })
  .map((pieces) => ({
    text: pieces.map(([each]) => each).join(""),
    width: pieces.reduce((sum, [, columns]) => sum + columns, 0),
  }));

/**
 * A line as a renderer might report it: runs one after another, some after a
 * gap, in any styles, the spaces among them in any colour, wide characters
 * among them.
 */
export const reportedLine: fc.Arbitrary<Run[]> = fc
  .array(
    fc.record({
      gap: fc.integer({ min: 0, max: 2 }),
      text,
      fg: color,
      bg: color,
      attributes: fc.subarray([...attributeNames]),
    }),
    { maxLength: 6 },
  )
  .map((pieces) => {
    let column = 0;
    return pieces.map(({ gap, text: { text, width }, ...piece }) => {
      const x = column + gap;
      column = x + width;
      return { ...piece, text, width, x };
    });
  });

/** The columns a line's runs reach: a screen this wide holds a run at its right edge. */
export const measureLine = (line: readonly Run[]) =>
  line.reduce((end, { x, width }) => Math.max(end, x + width), 0);
