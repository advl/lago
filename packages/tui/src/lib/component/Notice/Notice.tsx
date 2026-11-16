import type { ReactNode } from "react";
import { useTokens } from "../../tokens/index.js";
import type { NoticeProps } from "./types.js";
import wrapNotice from "./wrapNotice.js";

/** The indent of both lines, in display cells. */
const indent = 2;

/**
 * A reason and what to do about it. It stands in for a list when a
 * prerequisite is not met (`✗ the tool needs git`), and sits inside an
 * editor when a change was refused. The reason and the recovery each keep
 * rows of their own, never drawn over each other. In the recovery, the
 * words of each command after `run` stay on one line.
 */
const Notice = ({ reason, recovery, width }: NoticeProps): ReactNode => {
  const tokens = useTokens();
  const lines = wrapNotice(reason, recovery, width - indent);
  return (
    <box flexDirection="column" paddingLeft={indent}>
      {/* Each keeps its own rows, never drawn over the other. */}
      <text flexShrink={0} fg={tokens["color.text.error"]}>
        {lines.reason.join("\n")}
      </text>
      <text flexShrink={0} fg={tokens["color.text"]}>
        {lines.recovery.join("\n")}
      </text>
    </box>
  );
};

export default Notice;
