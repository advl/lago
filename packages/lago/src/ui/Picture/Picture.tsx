import type { ReactNode } from "react";
import paintPiece from "./paintPiece.js";
import placeRuns from "./placeRuns.js";
import type { PictureProps } from "./types.js";

/**
 * A story's picture drawn again as the story drew it, from line `from`, in
 * `lines` lines and `cols` columns, with the cursor's cell inverted.
 */
const Picture = ({
  picture,
  from = 0,
  lines,
  cols,
  cell,
}: PictureProps): ReactNode => (
  <box flexDirection="column" width={cols} height={lines}>
    {Array.from({ length: lines }, (_, offset) => {
      const y = from + offset;
      const pieces = placeRuns(
        picture.lines.at(y) ?? [],
        cols,
        cell?.y === y ? cell.x : undefined,
      );
      return (
        <box key={y} height={1}>
          <text>
            {pieces.map((piece) => (
              <span key={piece.x} {...paintPiece(piece)}>
                {piece.text}
              </span>
            ))}
          </text>
        </box>
      );
    })}
  </box>
);

export default Picture;
