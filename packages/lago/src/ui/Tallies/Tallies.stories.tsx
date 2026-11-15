import type { Meta, StoryObj } from "@aztlan/lago-react";
import { passingCatalog, sampleCatalog } from "../../../testing/catalogs.js";
import Component from "./Tallies.js";

const meta = {
  title: "ui/Tallies",
  component: Component,
  args: { tallies: sampleCatalog.tallies, failures: 1, width: 80 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every status, and a stories file that failed to load. */
export const Mixed: Story = {};

/** Every picture passing. */
export const Passing: Story = {
  args: { tallies: passingCatalog.tallies, failures: 0 },
};
