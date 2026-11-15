import type { Meta, StoryObj } from "@aztlan/lago-react";
import { keysPicture, tallPicture } from "../../../testing/pictures.js";
import Component from "./Picture.js";

const meta = {
  title: "ui/Picture",
  component: Component,
  args: { picture: keysPicture, lines: 5, cols: 40 },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A picture drawn again as its story drew it: colours, attributes, wide characters and an inverted row. */
export const Drawn: Story = {};

/** The cursor on a cell of the inverted row, which it shows as the story asked for it. */
export const Cursor: Story = { args: { cell: { x: 1, y: 3 } } };

/** A tall picture from its eleventh line, in three lines and six columns. */
export const Cut: Story = {
  args: { picture: tallPicture, from: 10, lines: 3, cols: 6 },
};
