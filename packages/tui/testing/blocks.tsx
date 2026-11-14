import { RGBA } from "@opentui/core";
import { GroupHeading, type GroupName, type ListBlock } from "../src/index.js";
import { fitRuns } from "../src/lib/fit/index.js";

/** A name drawn as a mark and a login in the team's hue, fitted to its room. */
export const markTeam =
  (login: string): GroupName =>
  (room) =>
    fitRuns(
      [{ text: `● ${login}`, fg: RGBA.fromIndex(4), marked: true }],
      room,
    );

/** A group's heading as a block of a list. */
const makeHeading = (
  key: string,
  name: GroupName,
  width: number,
): ListBlock<GroupName> => ({
  key,
  kind: "heading",
  lines: 1,
  node: <GroupHeading name={name} width={width} />,
  heading: name,
});

/** A row of two lines as a block of a list. */
const makeRow = (name: string): ListBlock<GroupName> => ({
  key: name,
  kind: "row",
  lines: 2,
  node: (
    <>
      <text>{`│ ${name}`}</text>
      <text>{"╵ an item"}</text>
    </>
  ),
});

/** bob's three rows, then one unassigned, for a list `width` cells wide. */
export const listShort = (width: number) => [
  makeHeading("bob", markTeam("bob"), width),
  makeRow("first of bob's"),
  makeRow("second of bob's"),
  makeRow("third of bob's"),
  makeHeading("unassigned", { text: "unassigned", kind: "words" }, width),
  makeRow("first unassigned"),
];

/** A contributor whose login is longer than the narrowest pane, then a team. */
export const listLong = (width: number) => [
  makeHeading(
    "contributor",
    markTeam("example-contributor-with-a-very-long-login"),
    width,
  ),
  makeRow("first of theirs"),
  makeRow("second of theirs"),
  makeRow("third of theirs"),
  makeHeading(
    "team",
    { text: "example-org/parser-team", kind: "words" },
    width,
  ),
  makeRow("first of the team's"),
];
