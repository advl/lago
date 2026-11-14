import { fitField, tokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { statusLooks } from "../constants.js";
import Difference from "../Difference/Difference.js";
import Picture from "../Picture/Picture.js";
import measureInspected from "./measureInspected.js";
import type { InspectProps } from "./types.js";

/**
 * One story inspected, in the whole region: its picture at the width it
 * was drawn, cut at the region's with the cut said in the title, scrolled
 * when it is taller than the region, with the cursor's cell inverted; or
 * the golden over it; or the error it threw, with its place in the source.
 * The scroll is held within what is shown.
 */
const Inspect = (props: InspectProps): ReactNode => {
  const { name, viewportName, record, scroll, cell, width, height } = props;
  const view = measureInspected(props);
  const { room } = view;
  const look = record ? statusLooks[record.status] : undefined;
  const actual = record?.actual;
  const cut =
    actual && actual.cols > room.cols
      ? ` · ${room.cols} of ${actual.cols} columns`
      : "";
  const title = look
    ? `${look.glyph} ${name} at ${viewportName} · ${look.word}${cut}`
    : `${name} at ${viewportName}`;
  let from = Math.min(scroll, view.scroll);
  let inside: ReactNode;
  if (view.shown === "difference" && actual && record?.expected) {
    inside = (
      <Difference
        expected={record.expected}
        actual={actual}
        from={from}
        lines={room.lines}
        cols={room.cols}
      />
    );
  } else if (view.shown === "picture" && actual) {
    if (cell) from = Math.min(Math.max(from, cell.y - room.lines + 1), cell.y);
    inside = (
      <Picture
        picture={actual}
        from={from}
        lines={Math.min(actual.rows, room.lines)}
        cols={view.cols}
        {...(cell && { cell })}
      />
    );
  } else {
    const fg =
      record?.error === undefined
        ? tokens["color.text.muted"]
        : statusLooks.error.color;
    inside = (
      <box flexDirection="column">
        {view.message.slice(from, from + room.lines).map((line, place) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the lines of one message, in order.
          <text key={place} fg={fg}>
            {line}
          </text>
        ))}
      </box>
    );
  }
  return (
    <box
      border
      borderStyle="single"
      borderColor={tokens["color.text"]}
      title={fitField({ text: title, kind: "words" }, "line", room.cols)}
      width={width}
      height={height}
    >
      {inside}
    </box>
  );
};

export default Inspect;
