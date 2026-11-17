import type { Meta, StoryObj } from "@aztlan/lago-react";
import { keysPicture } from "../../../testing/pictures.js";
import { makeRecord } from "../../../testing/records.js";
import Component from "./StoryBlock.js";
import type { StoryFrame } from "./types.js";

const frame = (overrides: Partial<StoryFrame>): StoryFrame => ({
  name: "Default",
  description: undefined,
  record: makeRecord("component/KeyBar", "Default", { actual: keysPicture }),
  extent: { cols: 16, rows: 5 },
  selected: false,
  matched: false,
  absent: "not drawn at this viewport",
  ...overrides,
});

const meta = {
  title: "ui/StoryBlock",
  component: Component,
  args: {
    frames: [
      frame({ selected: true }),
      frame({ name: "Matched", matched: true }),
    ],
    description: [],
    under: false,
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Two stories side by side: the selected one marked, the other holding the search's text. */
export const Beside: Story = {};

/** One story in a row, with its description beside it. */
export const Described: Story = {
  args: {
    frames: [frame({})],
    description: ["The keys that work now,", "each with its hint."],
  },
};

/** One story whose description goes under it, for want of room beside. */
export const Under: Story = {
  args: {
    frames: [frame({})],
    description: ["The keys that work now, each with its hint."],
    under: true,
  },
};

/** A story that threw, and one not drawn at the viewport shown. */
export const Thrown: Story = {
  args: {
    frames: [
      frame({
        name: "Thrown",
        record: makeRecord("component/Notice", "Thrown", {
          status: "error",
          actual: undefined,
          error:
            "TypeError: cannot read properties of undefined\n  at src/Notice.tsx:4:12",
        }),
        extent: { cols: 46, rows: 2 },
      }),
      frame({ name: "Wide", record: undefined, extent: { cols: 26, rows: 1 } }),
    ],
  },
};
