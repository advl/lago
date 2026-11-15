import type { Meta, StoryObj } from "@aztlan/lago-react";
import { sampleCatalog } from "../../../testing/catalogs.js";
import Component from "./TreeRow.js";

const [keyBar, notice] = sampleCatalog.groups.at(0)?.components ?? [];
if (!keyBar || !notice)
  throw new Error("The sample catalog lost its components.");

const meta = {
  title: "ui/TreeRow",
  component: Component,
  args: { component: keyBar, selected: false, width: 27 },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A component with a changed picture, and its two stories. */
export const Changed: Story = {};

/** The selected component, shaded, whose worst story threw. */
export const Selected: Story = { args: { component: notice, selected: true } };

/** A name longer than the tree, cut in its middle so its end still names it. */
export const Long: Story = {
  args: { component: { ...keyBar, name: "ExampleComponentWithALongName" } },
};
