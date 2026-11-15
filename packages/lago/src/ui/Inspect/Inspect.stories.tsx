import type { Meta, StoryObj } from "@aztlan/lago-react";
import { sampleCatalog } from "../../../testing/catalogs.js";
import Component from "./Inspect.js";

/** The sample catalog's picture of `title`'s story `name` at the terminal viewport. */
const pick = (title: string, name: string) =>
  sampleCatalog.groups
    .flatMap(({ components }) => components)
    .find((component) => component.title === title)
    ?.stories.find((story) => story.name === name)
    ?.pictures.find(({ viewportName }) => viewportName === "terminal");

const meta = {
  title: "ui/Inspect",
  component: Component,
  args: {
    name: "Default",
    viewportName: "terminal",
    record: pick("component/KeyBar", "Default"),
    scroll: 0,
    difference: false,
    width: 80,
    height: 20,
  },
  render: (args, { viewport }) => (
    <Component {...args} width={viewport.cols} height={viewport.rows - 4} />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A passing story at its whole size. */
export const Passing: Story = {};

/** The cursor reading a cell of the inverted row. */
export const Cell: Story = { args: { cell: { x: 1, y: 3 } } };

/** A picture taller than the region, scrolled ten lines. */
export const Scrolled: Story = {
  args: { name: "Tall", record: pick("layout/Pane", "Tall"), scroll: 10 },
};

/** A changed picture with its golden shown over it. */
export const Golden: Story = {
  args: {
    name: "Long",
    record: pick("component/KeyBar", "Long"),
    difference: true,
  },
};

/** A story that threw: its message and its place in the source. */
export const Thrown: Story = {
  args: { name: "Thrown", record: pick("component/Notice", "Thrown") },
};

/** A story not drawn at the viewport shown. */
export const NotDrawn: Story = {
  args: { name: "Missing", viewportName: "wide", record: undefined },
};
