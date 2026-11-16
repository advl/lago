import { fitField, type Tokens, useTokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { gutter, pictureLines } from "../../layout/index.js";
import { statusLooks } from "../constants.js";
import Picture from "../Picture/Picture.js";
import wrapMessage from "../wrapMessage.js";
import type { StoryBlockProps, StoryFrame } from "./types.js";

/** What a frame shows inside: the picture, the error a story threw, or that it is not drawn at the viewport. */
const drawInside = ({ record, extent }: StoryFrame, tokens: Tokens) => {
  const lines = Math.min(extent.rows, pictureLines);
  if (record?.actual) {
    return <Picture picture={record.actual} lines={lines} cols={extent.cols} />;
  }
  const [message, fg] =
    record?.error === undefined
      ? ["not drawn at this viewport", tokens["color.text.muted"]]
      : [record.error, tokens[statusLooks.error.color]];
  return (
    <box flexDirection="column">
      {wrapMessage(message, extent.cols)
        .slice(0, lines)
        .map((line, place) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the lines of one message, in order.
          <text key={place} fg={fg}>
            {line}
          </text>
        ))}
    </box>
  );
};

/** A story's frame: its picture in a border titled with its status and name. */
const Frame = ({ frame }: { readonly frame: StoryFrame }) => {
  const tokens = useTokens();
  const { name, record, extent, selected, matched } = frame;
  const status = record ? `${statusLooks[record.status].glyph} ` : "";
  let border = tokens["color.border"];
  if (matched) border = tokens["color.text.warning"];
  if (selected) border = tokens["color.text"];
  return (
    <box
      border
      borderStyle="single"
      borderColor={border}
      title={fitField(
        { text: `${selected ? "▸ " : ""}${status}${name}`, kind: "words" },
        "line",
        extent.cols - 2,
      )}
      width={extent.cols + 2}
      height={Math.min(extent.rows, pictureLines) + 2}
    >
      {drawInside(frame, tokens)}
    </box>
  );
};

/**
 * A block of a component's stories: two frames side by side, or one with
 * its description beside it or under it.
 */
const StoryBlock = ({
  frames,
  description,
  under,
}: StoryBlockProps): ReactNode => {
  const tokens = useTokens();
  return (
    <box flexDirection={under ? "column" : "row"} gap={under ? 0 : gutter}>
      {frames.map((frame) => (
        <Frame key={frame.name} frame={frame} />
      ))}
      {description.length > 0 && (
        <box flexDirection="column">
          {description.map((line, place) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: the lines of one description, in order.
            <text key={place} fg={tokens["color.text.muted"]}>
              {line}
            </text>
          ))}
        </box>
      )}
    </box>
  );
};

export default StoryBlock;
