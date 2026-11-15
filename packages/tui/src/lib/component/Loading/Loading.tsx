import type { ReactNode } from "react";
import { fitField } from "../../fit/index.js";
import { tokens } from "../../tokens/index.js";
import type { LoadingProps } from "./types.js";

/**
 * The line that says a read is under way whose progress cannot be
 * measured, wherever a region waits on one. The caller names what is
 * being read, and places the line at its indent.
 */
const Loading = ({ label, width }: LoadingProps): ReactNode => (
  <text fg={tokens["color.text"]}>{fitField(label, "line", width)}</text>
);

export default Loading;
