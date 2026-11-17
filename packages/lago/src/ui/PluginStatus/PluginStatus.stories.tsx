import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./PluginStatus.js";

const meta = {
  title: "ui/PluginStatus",
  component: Component,
  args: {
    placed: {
      items: [
        { text: "palette dracula", columns: 15 },
        { text: "grid at wide", columns: 12 },
      ],
      columns: 33,
    },
    selection: {
      title: "component/KeyBar",
      story: "Default",
      viewportName: "wide",
      mode: undefined,
      palette: "dracula",
    },
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The palette and a plugin's text, each after its separator. */
export const Texts: Story = {};

/** A plugin's component beside a text, drawn in the columns it asked for. */
export const Drawn: Story = {
  args: {
    placed: {
      items: [
        { text: "palette terminal", columns: 16 },
        {
          columns: 9,
          component: ({ selection }) => (
            <text>{`at ${selection.viewportName}`}</text>
          ),
        },
      ],
      columns: 31,
    },
  },
};
