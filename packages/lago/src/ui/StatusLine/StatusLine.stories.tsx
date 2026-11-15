import type { Meta, StoryObj } from "@aztlan/lago-react";
import { sampleCatalog } from "../../../testing/catalogs.js";
import { openingState, readSelection } from "../../state/index.js";
import Component from "./StatusLine.js";

const meta = {
  title: "ui/StatusLine",
  component: Component,
  args: {
    state: openingState,
    selection: readSelection(openingState, sampleCatalog),
    catalog: sampleCatalog,
    message: undefined,
    width: 80,
  },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A stories file that failed to load, named with the first line of its error. */
export const Failed: Story = {};

/** The search being typed, with its cursor. */
export const Searching: Story = {
  args: { state: { ...openingState, searching: true, search: "move" } },
};

/** A search kept, on its first match. */
export const Matches: Story = {
  args: {
    state: { ...openingState, search: "move" },
    selection: readSelection(
      { ...openingState, search: "move" },
      sampleCatalog,
    ),
  },
};

/** Before the first run ends. */
export const Running: Story = { args: { catalog: undefined } };
