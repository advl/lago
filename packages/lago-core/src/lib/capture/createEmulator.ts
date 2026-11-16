import { UnicodeGraphemesAddon } from "@xterm/addon-unicode-graphemes";
import headless from "@xterm/headless";
import type { Viewport } from "../screen/index.js";
import { normalizeRuns, type Run } from "../screenshot/index.js";
import readCell from "./readCell.js";
import type { Emulator } from "./types.js";

const { Terminal } = headless;

/**
 * A headless terminal of the given size that reads a program's bytes as a
 * terminal would.
 *
 * It translates a written newline into a return and a newline, as a
 * terminal's line discipline does, since a program writes `\n` and a frame
 * of several lines would otherwise be drawn as a staircase. It measures
 * characters by grapheme cluster, the rule renderers lay text out by, since
 * a narrower table places a border after an emoji in the wrong column.
 *
 * The emulator reads what it is written on a timer of its own. Where the
 * timers are faked, that timer fires only when the clock moves, so a caller
 * on a faked clock moves it until `isReading` turns false.
 *
 * @note Impure: creates a terminal that holds what it is written.
 */
export default function createEmulator({ cols, rows }: Viewport): Emulator {
  const terminal = new Terminal({
    cols,
    rows,
    convertEol: true,
    allowProposedApi: true,
  });
  terminal.loadAddon(new UnicodeGraphemesAddon());
  let reading = 0;
  return {
    write: (bytes) => {
      reading += 1;
      return new Promise((resolve) =>
        terminal.write(bytes, () => {
          reading -= 1;
          resolve();
        }),
      );
    },
    isReading: () => reading > 0,
    read: () => {
      const buffer = terminal.buffer.active;
      const lines = Array.from({ length: rows }, (_, y) => {
        const line = buffer.getLine(buffer.viewportY + y);
        const runs: Run[] = [];
        for (let x = 0; x < cols; x += 1) {
          const cell = line?.getCell(x);
          // The second column of a wide character is a cell of width 0.
          if (cell && cell.getWidth() > 0) runs.push(readCell(cell, x));
        }
        return normalizeRuns(runs);
      });
      return { cols, rows, lines };
    },
    dispose: () => terminal.dispose(),
  };
}
