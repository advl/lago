import type { Meta, StoryObj } from "@aztlan/lago-react";
import { keysPicture } from "../../../testing/pictures.js";
import Component from "./RunReader.js";

const meta = {
  title: "ui/RunReader",
  component: Component,
  args: { picture: keysPicture, cell: { x: 3, y: 2 }, width: 80 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The cursor on wide characters in a palette colour. */
export const OnRun: Story = {};

/** The cursor on the inverted row: its colours as the story asked for them. */
export const Inverted: Story = { args: { cell: { x: 1, y: 3 } } };

/** The cursor where nothing is drawn. */
export const Nothing: Story = { args: { cell: { x: 30, y: 1 } } };
