import { frameCells } from "../../layout/index.js";
import compareScreens from "../Difference/compareScreens.js";
import describePlace from "../describePlace.js";
import wrapMessage from "../wrapMessage.js";
import type { InspectedView, InspectProps } from "./types.js";

/**
 * What an inspected story shows in a region `width` by `height`, and its
 * limits: the scroll ends where the last line of what is shown reaches the
 * frame's last, and the cursor at the last cell of the picture drawn. The
 * difference takes its words, a gap, then one line for each line that
 * differs only in style and two for each whose text differs, as it is
 * drawn.
 */
export default function measureInspected({
  record,
  viewportName,
  mode,
  leftOut,
  difference,
  width,
  height,
}: Pick<
  InspectProps,
  | "record"
  | "viewportName"
  | "mode"
  | "leftOut"
  | "difference"
  | "width"
  | "height"
>): InspectedView {
  const room = {
    cols: width - frameCells.cols,
    lines: height - frameCells.rows,
  };
  const reach = (lines: number) => Math.max(0, lines - room.lines);
  const actual = record?.actual;
  const nothing = { message: [], cell: { x: 0, y: 0 } };
  if (actual && record?.expected && record.status === "changed" && difference) {
    const lines = compareScreens(record.expected, actual).reduce(
      (total, { kind }) => total + (kind === "style" ? 1 : 2),
      2,
    );
    return {
      shown: "difference",
      room,
      cols: room.cols,
      scroll: reach(lines),
      ...nothing,
    };
  }
  if (actual) {
    const cols = Math.min(actual.cols, room.cols);
    return {
      shown: "picture",
      room,
      cols,
      message: [],
      scroll: reach(actual.rows),
      cell: { x: cols - 1, y: actual.rows - 1 },
    };
  }
  let text = `This story is not drawn at ${describePlace(viewportName, mode)}.`;
  if (leftOut) text = `This story's parameters.modes leaves ${mode} out.`;
  const message = wrapMessage(record?.error ?? text, room.cols);
  return {
    shown: "message",
    room,
    cols: room.cols,
    scroll: reach(message.length),
    ...nothing,
    message,
  };
}
