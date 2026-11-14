import { fitField, Loading, tokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import type { Selection } from "../../state/index.js";
import RunReader from "../RunReader/RunReader.js";
import type { StatusLineProps } from "./types.js";

/** The search's matches, in words. */
const describeMatches = (search: string, { hits, hit }: Selection) =>
  hits.length === 0
    ? `“${search}”: no match`
    : `“${search}”: match ${hit + 1} of ${hits.length}`;

/**
 * The status line: the question to accept, what is being typed, the cell
 * under the cursor, what the gallery last did, the search's matches, a
 * stories file that failed to load, or that the gallery is watching, in
 * that order of precedence.
 */
const StatusLine = ({
  state,
  selection,
  catalog,
  message,
  width,
}: StatusLineProps): ReactNode => {
  const say = (text: string, fg = tokens["color.text"]) => (
    <text fg={fg}>{fitField({ text, kind: "quote" }, "line", width)}</text>
  );
  if (selection.confirming) {
    const { name, viewportName } = selection.confirming;
    return say(
      `accept ${name} at ${viewportName} as its golden? y accepts, Esc keeps the golden`,
    );
  }
  if (state.filtering) return say(`filter: ${state.filter}▏`);
  if (state.searching) return say(`search: ${state.search}▏`);
  const actual = selection.record?.actual;
  if (state.cell && actual) {
    return <RunReader picture={actual} cell={state.cell} width={width} />;
  }
  if (message !== undefined) return say(message);
  if (!catalog) {
    return (
      <Loading
        label={{ text: "running the stories…", kind: "words" }}
        width={width}
      />
    );
  }
  if (state.search !== "") return say(describeMatches(state.search, selection));
  const [failure] = catalog.failures;
  if (failure) {
    const [line] = failure.message.split("\n");
    return say(`${failure.file}: ${line}`, tokens["color.text.error"]);
  }
  return say("watching the stories for changes", tokens["color.text.muted"]);
};

export default StatusLine;
