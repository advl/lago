import type { Meta, StoryObj } from "@aztlan/lago-react";
import { crowdedCatalog, modesCatalog } from "../../../testing/catalogs.js";
import { filterComponents } from "../../search/index.js";
import { listColumns } from "../../state/index.js";
import Component from "./Matrix.js";

const meta = {
  title: "ui/Matrix",
  component: Component,
  args: {
    components: filterComponents(modesCatalog, ""),
    columns: listColumns(modesCatalog),
    selected: { title: "component/Badge", story: 2, column: 1 },
    filter: "",
    first: { row: 0, column: 0 },
    onShown: () => {},
    width: 80,
    height: 12,
  },
  render: (args, { viewport }) => (
    <Component {...args} width={viewport.cols} height={viewport.rows} />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every state a cell takes, the selected one an equal where the mode expected a change. */
export const States: Story = {};

/** More rows and columns than the region holds, scrolled to the selected cell at the end of both. */
export const Scrolled: Story = {
  args: {
    components: filterComponents(crowdedCatalog, ""),
    columns: listColumns(crowdedCatalog),
    selected: { title: "layout/Pane", story: 7, column: 11 },
  },
};
