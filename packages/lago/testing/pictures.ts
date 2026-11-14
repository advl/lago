import type { Run, Screenshot } from "@aztlan/lago-react";

const plain = { fg: "default", bg: "default", attributes: [] } as const;

const run = (x: number, text: string, look: Partial<Run> = {}): Run => ({
  x,
  text,
  width: [...text].length,
  ...plain,
  ...look,
});

/**
 * A screen as a key bar's story draws it: keys in the terminal's colour,
 * labels in palette 7, a bold key, a row of wide characters, and a selected
 * row drawn inverted, which a screenshot gives with its colours exchanged.
 */
export const keysPicture: Screenshot = {
  cols: 40,
  rows: 5,
  lines: [
    [
      run(0, "↑↓"),
      run(3, "move", { fg: 7 }),
      run(8, "?", { attributes: ["bold"] }),
    ],
    [],
    [run(2, "日本", { width: 4, fg: 2 }), run(7, "wide", { fg: "#ff8800" })],
    [
      run(0, " selected row ", {
        fg: "default",
        bg: 2,
        attributes: ["inverse"],
      }),
    ],
    [run(0, "underlined", { attributes: ["italic", "underline"] })],
  ],
};

/** A picture taller than the list shows: 30 numbered lines. */
export const tallPicture: Screenshot = {
  cols: 20,
  rows: 30,
  lines: Array.from({ length: 30 }, (_, line) => [run(0, `line ${line + 1}`)]),
};
