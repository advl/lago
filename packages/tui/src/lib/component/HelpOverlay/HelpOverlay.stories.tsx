import type { Meta, StoryObj } from "@aztlan/lago-react";
import { everyCommand, longCommands } from "../../../../testing/commands.js";
import Component from "./HelpOverlay.js";

const meta = {
  title: "component/HelpOverlay",
  component: Component,
  args: {
    commands: everyCommand,
    note: { text: "windows are counted in working time", kind: "words" },
    width: 40,
    height: 36,
  },
  render: (args, { viewport }) => (
    <Component {...args} width={viewport.cols} height={viewport.rows} />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every key bound, as `?` shows them, with room for them all. */
export const Keys: Story = {};

/** As many keys as the help lists. */
export const Long: Story = {
  args: { commands: longCommands },
};

/**
 * A pane too short for the help, scrolled into the list's keys: their
 * heading pinned with the place of the first key line shown, and the key
 * lines under the pane counted.
 */
export const Scrolled: Story = {
  args: { first: 5 },
  parameters: { viewports: { narrow: { rows: 8 }, wide: { rows: 8 } } },
};
