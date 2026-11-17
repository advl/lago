import { fitField, measureText, useTokens } from "@aztlan/tui";
import { type ReactNode, useEffect } from "react";
import { findPicture, isLeftOut } from "../../catalog/index.js";
import { listRows } from "../../state/index.js";
import { cellColumns, labelColumns, legend } from "./constants.js";
import placeWindow from "./placeWindow.js";
import readMark from "./readMark.js";
import type { Mark, MatrixProps } from "./types.js";

/** `text` cut to `cols` columns, and filled with spaces to them. */
const fill = (text: string, cols: number) => {
  const cut = fitField({ text, kind: "words" }, "line", cols);
  return cut + " ".repeat(Math.max(0, cols - measureText(cut)));
};

/** One of the legend's pieces: a mark, and its glyph and words as they fit. */
interface LegendPiece {
  readonly mark: Mark;
  readonly text: string;
}

/**
 * The legend's pieces placed on as few lines of `cols` columns as they
 * take, each cut to the line when it is wider, so none wraps.
 */
function placeLegend(cols: number): LegendPiece[][] {
  const lines: LegendPiece[][] = [];
  let used = cols;
  for (const mark of legend) {
    const text = fitField(
      { text: `${mark.glyph} ${mark.word}`, kind: "words" },
      "line",
      cols,
    );
    const wide = measureText(text);
    if (used + 2 + wide > cols) {
      lines.push([{ mark, text }]);
      used = wide;
    } else {
      lines.at(-1)?.push({ mark, text: `  ${text}` });
      used += 2 + wide;
    }
  }
  return lines;
}

/**
 * The matrix: one row for each story, under its component's name, and one
 * column for each viewport in the base and then in each mode, the
 * viewport's name over its columns and each mode's under it. A cell shows
 * its picture's state by a glyph: ✓ passing, ± changed, + new, = equal to
 * the base, ! equal where the mode expected a change, ✗ an error, and blank
 * where the story is not covered. The selected cell is bracketed. A matrix
 * larger than the region scrolls both ways to keep the selected cell in
 * view, moved as little as it can from where it was last shown, and its
 * title says which rows and columns are shown, and the filter that leaves
 * them; a name too long for its column is cut. A legend closes it.
 */
const Matrix = ({
  components,
  columns,
  selected,
  filter,
  first: last,
  onShown,
  width,
  height,
}: MatrixProps): ReactNode => {
  const tokens = useTokens();
  const inside = { cols: width - 2, lines: height - 2 };
  const rows = listRows(components);
  const cell = Math.min(
    cellColumns.most,
    Math.max(
      cellColumns.least,
      ...columns.map(({ mode }) => measureText(mode ?? "base") + 1),
    ),
  );
  const label = Math.max(
    1,
    Math.min(
      labelColumns,
      inside.cols - cell,
      Math.max(
        0,
        ...rows.map(
          ({ component, story }) =>
            measureText(`${component.name} ${story.name}`) + 3,
        ),
      ),
    ),
  );
  // The rows come before the legend: a region too short for both keeps a
  // row and as much of the legend as fits under it.
  const legendLines = placeLegend(inside.cols).slice(
    0,
    Math.max(0, inside.lines - 3),
  );
  const lines = Math.max(1, inside.lines - 2 - legendLines.length);
  const across = Math.max(1, Math.floor((inside.cols - label) / cell));
  const row = rows.findIndex(
    ({ component, place }) =>
      component.title === selected.title && place === selected.story,
  );
  const first = {
    row: placeWindow(last.row, row, lines, rows.length),
    column: placeWindow(last.column, selected.column, across, columns.length),
  };
  useEffect(() => {
    onShown(first);
  });
  const visibleRows = rows.slice(first.row, first.row + lines);
  const visibleColumns = columns.slice(first.column, first.column + across);
  const cut =
    visibleRows.length < rows.length || visibleColumns.length < columns.length
      ? ` · stories ${first.row + 1}–${first.row + visibleRows.length}, columns ${first.column + 1}–${first.column + visibleColumns.length}`
      : "";
  const filtered = filter === "" ? "" : ` · filtered by “${filter}”`;
  const counted = `${rows.length} ${rows.length === 1 ? "story" : "stories"}`;
  const title = `matrix · ${counted} in ${columns.length} columns${filtered}${cut}`;
  // Each viewport's name heads the columns that follow it, as far as they are shown.
  const sizes = visibleColumns.map((column, place) => {
    const starts =
      place === 0 ||
      column.viewportName !== visibleColumns.at(place - 1)?.viewportName;
    if (!starts) return "";
    let span = 1;
    while (
      visibleColumns.at(place + span)?.viewportName === column.viewportName
    ) {
      span += 1;
    }
    return fill(column.viewportName, span * cell - 1).concat(" ");
  });
  return (
    <box
      border
      borderStyle="single"
      borderColor={tokens["color.text"]}
      title={fitField({ text: title, kind: "words" }, "line", inside.cols)}
      flexDirection="column"
      width={width}
      height={height}
    >
      {rows.length === 0 ? (
        <text fg={tokens["color.text.muted"]}>
          {fitField(
            { text: "no story to show", kind: "words" },
            "line",
            inside.cols,
          )}
        </text>
      ) : (
        <>
          <text fg={tokens["color.text"]}>
            {fill("", label)}
            {sizes.join("")}
          </text>
          <text fg={tokens["color.text.muted"]}>
            {fill("story", label)}
            {visibleColumns
              .map(({ mode }) => fill(mode ?? "base", cell - 1).concat(" "))
              .join("")}
          </text>
        </>
      )}
      {visibleRows.map(({ component, story, place }, at) => {
        const chosen = first.row + at === row;
        return (
          <text key={`${component.title} ${place}`} fg={tokens["color.text"]}>
            {fill(
              `${chosen ? "▸ " : "  "}${component.name} ${story.name}`,
              label,
            )}
            {visibleColumns.map((column, offset) => {
              const mark = readMark(
                findPicture(story, column.viewportName, column.mode),
                isLeftOut(story, column.viewportName, column.mode),
              );
              const picked =
                chosen && first.column + offset === selected.column;
              return (
                <span
                  key={`${column.viewportName}@${column.mode}`}
                  fg={tokens[mark.color]}
                  {...(picked && { bg: tokens["color.background.selected"] })}
                >
                  {fill(picked ? `[${mark.glyph}]` : ` ${mark.glyph}`, cell)}
                </span>
              );
            })}
          </text>
        );
      })}
      <box flexGrow={1} />
      {legendLines.map((pieces, place) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the legend's lines, in a fixed order.
        <text key={place}>
          {pieces.map(({ mark, text }) => (
            <span key={mark.word} fg={tokens[mark.color]}>
              {text}
            </span>
          ))}
        </text>
      ))}
    </box>
  );
};

export default Matrix;
