import { fitField, Loading, measureText, useTokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import type { Selection } from "../../state/index.js";
import describePlace from "../describePlace.js";
import RunReader from "../RunReader/RunReader.js";
import type { StatusLineProps } from "./types.js";

/** The search's matches, in words. */
const describeMatches = (search: string, { hits, hit }: Selection) =>
  hits.length === 0
    ? `“${search}”: no match`
    : `“${search}”: match ${hit + 1} of ${hits.length}`;

/**
 * What the status line says, in `width` columns: the question to accept,
 * what is being typed, the cell under the cursor, what the gallery last
 * did, the search's matches, that an inspected mode's picture is the base
 * picture, a stories file that failed to load, or that the gallery is
 * watching, in that order of precedence.
 */
const Said = ({
  state,
  selection,
  catalog,
  message,
  width,
}: Omit<StatusLineProps, "items">): ReactNode => {
  const tokens = useTokens();
  const say = (text: string, fg = tokens["color.text"]) => (
    <text fg={fg}>{fitField({ text, kind: "quote" }, "line", width)}</text>
  );
  if (selection.confirming) {
    const { name, viewportName, mode } = selection.confirming;
    return say(
      `accept ${name} at ${describePlace(viewportName, mode)} as its golden? y accepts, Esc keeps the golden`,
    );
  }
  if (state.filtering) return say(`filter: ${state.filter}▏`);
  if (state.searching) return say(`search: ${state.search}▏`);
  const { record } = selection;
  const actual = record?.actual;
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
  if (state.inspecting && record?.comparison === "equal") {
    return say(
      "equal to the base picture, so it keeps no golden of its own",
      tokens["color.text.muted"],
    );
  }
  const [failure] = catalog.failures;
  if (failure) {
    const [line] = failure.message.split("\n");
    return say(`${failure.file}: ${line}`, tokens["color.text.error"]);
  }
  return say("watching the stories for changes", tokens["color.text.muted"]);
};

/**
 * The status line: what the gallery has to say, and after it, when there
 * are any, the status items, such as the size and the mode shown, each
 * apart by a dot. The items take what they need, up to half the line, and
 * what is said takes the rest.
 */
const StatusLine = ({
  items = [],
  width,
  ...said
}: StatusLineProps): ReactNode => {
  const tokens = useTokens();
  if (items.length === 0) return <Said {...said} width={width} />;
  const text = items.join(" · ");
  const cols = Math.min(measureText(text), Math.floor(width / 2));
  const room = width - cols - 1;
  return (
    <box flexDirection="row" width={width} height={1}>
      <box width={room} marginRight={1}>
        <Said {...said} width={room} />
      </box>
      <text fg={tokens["color.text.muted"]}>
        {fitField({ text, kind: "words" }, "line", cols)}
      </text>
    </box>
  );
};

export default StatusLine;
