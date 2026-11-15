import type { ReactNode } from "react";
import { fitField } from "../../fit/index.js";
import { tokens } from "../../tokens/index.js";
import type { PaneProps } from "./types.js";

/**
 * The pane is the whole terminal screen, drawn on a character grid. It
 * stretches with the terminal and never rearranges. Narrower than
 * `minColumns`, or shorter than `minLines`, it shows only one wrapped line
 * saying what the application needs, the width first.
 */
const Pane = ({
  name,
  minColumns,
  minLines,
  width,
  height,
  header,
  children,
  counts,
  status,
  keys,
  help,
}: PaneProps): ReactNode => (
  <box
    flexDirection="column"
    width="100%"
    height="100%"
    backgroundColor={tokens["color.background"]}
  >
    {width < minColumns || height < minLines ? (
      <text fg={tokens["color.text"]}>
        {fitField(
          {
            text:
              width < minColumns
                ? `${name} needs ${minColumns} columns`
                : `${name} needs ${minLines} lines`,
            kind: "words",
          },
          "block",
          width,
        ).join("\n")}
      </text>
    ) : (
      <>
        {header}
        {help ?? (
          <>
            <box
              flexDirection="column"
              flexGrow={1}
              flexShrink={1}
              overflow="hidden"
            >
              {children}
            </box>
            {status !== undefined && (
              <>
                {counts ?? <box height={1} />}
                {status}
              </>
            )}
            {keys}
          </>
        )}
      </>
    )}
  </box>
);

export default Pane;
