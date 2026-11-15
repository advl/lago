import type { Run } from "@aztlan/lago-react";
import { measureText } from "@aztlan/tui";
import type { DrawnPiece } from "./types.js";

/** How a column no run covers is drawn: blank, in the terminal's own colours. */
const blank = { fg: "default", bg: "default", attributes: [] } as const;

const graphemes = new Intl.Segmenter();

/** A run's characters, each with the columns it takes. */
function splitRun({ text, width }: Run) {
  const characters = [...graphemes.segment(text)].map(({ segment }) => segment);
  return characters.length === width
    ? characters.map((character) => ({ character, columns: 1 }))
    : characters.map((character) => ({
        character,
        columns: measureText(character),
      }));
}

/**
 * The pieces a line of runs is drawn in again, within `cols` columns: the
 * gaps between runs as blank pieces, a character that would cross the last
 * column dropped, and the cell at `cursor` a piece of its own. A cursor past
 * the line's last run stands on a blank cell.
 */
export default function placeRuns(
  runs: readonly Run[],
  cols: number,
  cursor?: number,
): DrawnPiece[] {
  const cells: { x: number; character: string; look: Run | typeof blank }[] =
    [];
  let at = 0;
  for (const run of runs) {
    for (; at < Math.min(run.x, cols); at += 1) {
      cells.push({ x: at, character: " ", look: blank });
    }
    for (const { character, columns } of splitRun(run)) {
      if (at + columns > cols) break;
      cells.push({ x: at, character, look: run });
      at += columns;
    }
  }
  if (cursor !== undefined) {
    for (; at <= Math.min(cursor, cols - 1); at += 1) {
      cells.push({ x: at, character: " ", look: blank });
    }
  }
  const pieces: (DrawnPiece & { look: Run | typeof blank })[] = [];
  cells.forEach(({ x, character, look }, place) => {
    const next = cells.at(place + 1)?.x ?? at;
    const onCursor = cursor !== undefined && x <= cursor && cursor < next;
    const last = pieces.at(-1);
    if (last && last.look === look && last.cursor === onCursor) {
      pieces[pieces.length - 1] = { ...last, text: last.text + character };
    } else {
      const { fg, bg, attributes } = look;
      pieces.push({
        x,
        text: character,
        fg,
        bg,
        attributes,
        cursor: onCursor,
        look,
      });
    }
  });
  return pieces.map(({ look: _, ...piece }) => piece);
}
