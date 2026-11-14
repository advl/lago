import type { ReactNode } from "react";
import { fitField } from "../../fit/index.js";
import { tokens } from "../../tokens/index.js";
import type { EmptyStateProps } from "./types.js";

/** The indent of the message, in display cells. */
const indent = 2;

/**
 * What a list's region shows when there is nothing to list: `nothing to review`.
 */
const EmptyState = ({ message, width }: EmptyStateProps): ReactNode => (
  <text fg={tokens["color.text"]}>
    {" ".repeat(indent)}
    {fitField(message, "line", width - indent)}
  </text>
);

export default EmptyState;
