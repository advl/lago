import type { Meta, StoryObj } from "@aztlan/lago-react";
import { RGBA } from "@opentui/core";
import { fitRuns } from "../../fit/index.js";
import Component from "./GroupHeading.js";

/** bob's mark and login in the team's hue, fitted to the room the heading gives. */
const markBob = (room: number) =>
  fitRuns([{ text: "● bob", fg: RGBA.fromIndex(4), marked: true }], room);

const meta = {
  title: "component/GroupHeading",
  component: Component,
  args: { name: { text: "ISSUES", kind: "words" }, width: 40 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A section named by the application, in capitals. */
export const Words: Story = {};

/**
 * A name drawn in two looks, a mark and a login in a hue of its own, which
 * the caller fits to the room the heading gives it.
 */
export const Marked: Story = {
  args: { name: markBob },
};

/** A repository with a long name, cut in its middle so its end shows. */
export const Long: Story = {
  args: {
    name: {
      text: "example-repository-with-a-long-name/release-branch",
      kind: "identifier",
    },
  },
};

/** Pinned above its rows while they scroll, the first row shown the third of five. */
export const Pinned: Story = {
  args: {
    name: markBob,
    count: { text: "3 of 5", kind: "figure" },
  },
};
