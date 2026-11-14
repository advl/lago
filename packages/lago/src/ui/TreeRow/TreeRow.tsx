import { fitField, measureText, tokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { statusLooks } from "../constants.js";
import type { TreeRowProps } from "./types.js";

/**
 * A component's row in the tree: its worst status, its name, and how many
 * stories it has, at the row's right edge. The selected row is shaded.
 */
const TreeRow = ({ component, selected, width }: TreeRowProps): ReactNode => {
  const look = statusLooks[component.status];
  const count = String(component.stories.length);
  const name = fitField(
    { text: component.name, kind: "identifier" },
    "line",
    width - 3 - count.length,
  );
  const gap = width - 2 - measureText(name) - count.length;
  return (
    <text
      bg={
        selected
          ? tokens["color.background.selected"]
          : tokens["color.background"]
      }
    >
      <span fg={look.color}>{look.glyph} </span>
      <span fg={tokens["color.text"]}>{name + " ".repeat(gap)}</span>
      <span fg={tokens["color.text.muted"]}>{count}</span>
    </text>
  );
};

export default TreeRow;
