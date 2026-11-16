import { fitField, useTokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { statusLooks } from "../constants.js";
import compareScreens from "./compareScreens.js";
import describeDifference from "./describeDifference.js";
import type { DifferenceProps } from "./types.js";

/** The columns before a line's text: its number, and the mark that says which picture it is from. */
const gutterColumns = 6;

/**
 * The golden's lines over the picture's, where they differ: the difference
 * in words first, then each line that differs by its number, the golden's
 * text marked `−` and the picture's `+`, or once, marked `~`, when only its
 * colours or attributes differ.
 */
const Difference = ({
  expected,
  actual,
  from,
  lines,
  cols,
}: DifferenceProps): ReactNode => {
  const tokens = useTokens();
  const differing = compareScreens(expected, actual);
  const fitText = (text: string) =>
    fitField({ text, kind: "quote" }, "line", cols - gutterColumns);
  const rows = differing.flatMap(
    ({ line, expected: before, actual: after, kind }) => {
      const number = String(line + 1).padStart(3);
      return kind === "style"
        ? [
            {
              key: `${line}~`,
              number,
              mark: "~",
              fg: tokens[statusLooks.changed.color],
              text: after,
            },
          ]
        : [
            {
              key: `${line}−`,
              number,
              mark: "−",
              fg: tokens[statusLooks.error.color],
              text: before,
            },
            {
              key: `${line}+`,
              number: "   ",
              mark: "+",
              fg: tokens[statusLooks.pass.color],
              text: after,
            },
          ];
    },
  );
  return (
    <box flexDirection="column" width={cols} height={lines}>
      {[
        <text key="words" fg={tokens["color.text"]}>
          {fitField(
            {
              text: describeDifference(differing, expected, actual),
              kind: "quote",
            },
            "line",
            cols,
          )}
        </text>,
        <text key="gap"> </text>,
        ...rows.map(({ key, number, mark, fg, text }) => (
          <text key={key}>
            <span fg={tokens["color.text.muted"]}>{`${number} `}</span>
            <span fg={fg}>{`${mark} `}</span>
            <span fg={tokens["color.text"]}>{fitText(text)}</span>
          </text>
        )),
      ].slice(from, from + lines)}
    </box>
  );
};

export default Difference;
