import type { Meta, StoryObj } from "@aztlan/lago-react";
import { listLong, listShort } from "../../../../testing/blocks.js";
import Component from "./ScrolledList.js";

const meta = {
  title: "layout/ScrolledList",
  component: Component,
  args: {
    blocks: listShort(40),
    from: 1,
    to: 1,
    height: 6,
    onShown: () => {},
    width: 40,
  },
  render: (args, { viewport }) => (
    <Component
      {...args}
      blocks={listShort(viewport.cols)}
      width={viewport.cols}
    />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The top of the list: its first heading in its place, nothing pinned, and
 * the rows under the pane counted on its last line.
 */
export const Top: Story = {};

/**
 * Scrolled to bob's third row: his heading pinned above his second, with
 * where the rows shown start among his three, and the unassigned row under
 * the pane counted.
 */
export const Pinned: Story = {
  args: { from: 3, to: 3, first: 2 },
};

/**
 * The long-named contributor's section scrolled to their third row: the
 * pinned heading cuts the login before its place, and the team's row under
 * the pane is counted.
 */
export const Long: Story = {
  args: { from: 3, to: 3, first: 2 },
  render: (args, { viewport }) => (
    <Component
      {...args}
      blocks={listLong(viewport.cols)}
      width={viewport.cols}
    />
  ),
};
