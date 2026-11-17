import type { Meta, StoryObj } from "@aztlan/lago-react";
import {
  crowdedCatalog,
  modesCatalog,
  sampleCatalog,
} from "../../../testing/catalogs.js";
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

/** A component's stories in a mode, which the status line names after the size: a picture of its own, a changed one, and one equal where a change was expected. */
export const Modes: Story = {
  args: { catalog: modesCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}m");
  },
};

/** A mode's picture equal to the base's, inspected: the base picture, which keeps no golden of its own. */
export const Equal: Story = {
  args: { catalog: modesCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}mm{Enter}");
  },
};

/** Every key of a project with modes: `m` with the modes and the globals drawn. */
export const ModesHelp: Story = {
  args: { catalog: modesCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("?jjjjjjjjj");
  },
};

/** The matrix: every story in every size and mode, with a cell in each state and the first selected. */
export const Matrix: Story = {
  args: { catalog: modesCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("x");
  },
};

/** A changed cell of the matrix opened on its difference, which Esc leaves for the matrix. */
export const MatrixCell: Story = {
  args: { catalog: modesCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("xjl{Enter}");
  },
};

/** A matrix larger than the terminal, scrolled to a cell far down and to the right, its long mode names cut. */
export const MatrixCrowded: Story = {
  args: { catalog: crowdedCatalog },
  play: async ({ userEvent }) => {
    await userEvent.keyboard(`x${"j".repeat(18)}${"l".repeat(8)}`);
  },
};
