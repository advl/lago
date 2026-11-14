import type { Meta, StoryObj } from "@aztlan/lago-react";
import { drawPicture } from "../../../testing/records.js";
import Component from "./Difference.js";

const expected = drawPicture(["title", "first row", "second row"]);

const meta = {
  title: "ui/Difference",
  component: Component,
  args: {
    expected,
    actual: drawPicture(["title", "first line", "second row"]),
    from: 0,
    lines: 10,
    cols: 78,
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** One line whose text changed: the golden's over the picture's. */
export const Text: Story = {};

/** A picture grown by a line, and a line that differs only in its attributes. */
export const Resized: Story = {
  args: {
    actual: {
      ...drawPicture(["title", "first row", "second row", "third row"]),
      lines: [
        ...expected.lines
          .slice(0, 1)
          .map((runs) =>
            runs.map((run) => ({ ...run, attributes: ["bold" as const] })),
          ),
        ...drawPicture(["first row", "second row", "third row"]).lines,
      ],
    },
  },
};
