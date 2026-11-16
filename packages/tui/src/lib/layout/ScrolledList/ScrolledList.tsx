import { type ReactNode, useEffect } from "react";
import { GroupHeading } from "../../component/index.js";
import { fitField } from "../../fit/index.js";
import { useListScroll } from "../../list/index.js";
import { useTokens } from "../../tokens/index.js";
import type { ScrolledListProps } from "./types.js";

/**
 * A list of whole blocks in a region of fixed height: it keeps the
 * selection whole where the room allows, pins the heading of the group
 * under its first line, and counts the rows below. The help overlay is
 * scrolled by the same rules.
 */
const ScrolledList = ({
  blocks,
  from,
  to,
  height,
  first: firstShown,
  onShown,
  width,
  rules,
}: ScrolledListProps): ReactNode => {
  const tokens = useTokens();
  const { shown, first, pinned, below } = useListScroll({
    blocks,
    from,
    to,
    room: height,
    first: firstShown,
  });
  const rows = shown.filter(({ kind }) => kind === "row").length;
  useEffect(() => {
    onShown(rows, first);
  });
  return (
    <box flexDirection="column" height={height} overflow="hidden">
      {pinned && (
        <box flexShrink={0}>
          <GroupHeading
            name={pinned.heading}
            count={{
              text: `${pinned.place} of ${pinned.size}`,
              kind: "figure",
            }}
            width={width}
            rules={rules}
          />
        </box>
      )}
      <box
        flexDirection="column"
        flexShrink={0}
        height={Math.max(0, height - (pinned ? 1 : 0) - (below > 0 ? 1 : 0))}
        overflow="hidden"
      >
        {shown.map(({ key, node }) => (
          <box key={key} flexDirection="column" flexShrink={0}>
            {typeof node === "function" ? node() : node}
          </box>
        ))}
      </box>
      {below > 0 && (
        <text flexShrink={0} fg={tokens["color.text.muted"]}>
          {fitField(
            {
              text: `  ${tokens["glyph.below"]} ${below} below`,
              kind: "figure",
            },
            "line",
            width,
          )}
        </text>
      )}
    </box>
  );
};

export default ScrolledList;
