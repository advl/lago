import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./EmptyState.js";

const meta = {
  title: "component/EmptyState",
  component: Component,
  args: { message: { text: "nothing owed", kind: "words" }, width: 40 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A list with nothing in it. */
export const NothingOwed: Story = {};

/** The longest message a list's region gives. */
export const Long: Story = {};
