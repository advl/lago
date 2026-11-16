import type { Meta, StoryObj } from "@aztlan/lago-react";
import { sampleCatalog } from "../../../testing/catalogs.js";
import { buildCatalog } from "../../catalog/index.js";
import Component from "./Gallery.js";

const meta = {
  title: "ui/Gallery",
  component: Component,
  args: {
    catalog: sampleCatalog,
    name: "project",
    onAccept: () => Promise.resolve(),
    onQuit: () => {},
    width: 80,
    height: 24,
  },
  render: (args, { viewport }) => (
    <Component {...args} width={viewport.cols} height={viewport.rows} />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** As the gallery opens: the tree beside the first component's stories, a failed file in the status line. */
export const Tree: Story = {};

/** A component's stories open, the one that threw selected. */
export const Stories: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("j{Enter}j");
  },
};

/** A story inspected at its whole size. */
export const Inspected: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}{Enter}");
  },
};

/** A changed picture with its golden over it. */
export const Golden: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}l{Enter}d");
  },
};

/** The cursor reading a cell, described in the status line. */
export const Cells: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}{Enter}clll");
  },
};

/** The gallery asking to accept a changed picture. */
export const Asking: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}l{Enter}{Shift>}a{/Shift}");
  },
};

/** The tree filtered as the filter is typed. */
export const Filtering: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("/pa");
  },
};

/** A search kept, on its first match. */
export const Searching: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}/move{Enter}");
  },
};

/** Every key, grouped by what it acts on. */
export const Help: Story = {
  play: async ({ userEvent }) => {
    await userEvent.keyboard("?");
  },
};

/** Before the first run ends. */
export const Running: Story = { args: { catalog: undefined } };

/** A project with no stories yet. */
export const Empty: Story = { args: { catalog: buildCatalog([]) } };

/** A terminal a column narrower than the gallery needs, and one a line shorter. */
export const TooSmall: Story = {
  parameters: { viewports: { terminal: { cols: 79 }, wide: { rows: 23 } } },
};
