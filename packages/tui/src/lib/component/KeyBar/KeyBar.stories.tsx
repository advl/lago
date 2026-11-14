import type { Meta, StoryObj } from "@aztlan/lago-react";
import {
  activityCommands,
  longCommands,
  owedCommands,
} from "../../../../testing/commands.js";
import Component from "./KeyBar.js";

const meta = {
  title: "component/KeyBar",
  component: Component,
  args: { commands: owedCommands, width: 40 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The keys of the first mode. */
export const Owed: Story = {};

/** The keys of the second mode, with the time window. */
export const Activity: Story = {
  args: { commands: activityCommands },
};

/** More keys than 40 columns hold. */
export const Long: Story = {
  args: { commands: longCommands },
};
