import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./PaneHeader.js";

const meta = {
  title: "subcomponent/PaneHeader",
  component: Component,
  args: { title: { text: "owed", kind: "words" }, width: 40 },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A mode with no grouping: one list, then the sort, dimmed. */
export const Owed: Story = {
  args: {
    address: { text: "one list", kind: "words" },
    sort: { text: "overdue first", kind: "words" },
  },
};

/** The same mode, grouped. */
export const OwedByOwner: Story = {
  args: {
    address: { text: "by owner", kind: "words" },
    sort: { text: "overdue first", kind: "words" },
  },
};

/** A mode that names its window, then its grouping, then its sort. */
export const Activity: Story = {
  args: {
    title: { text: "activity", kind: "words" },
    address: { text: "24h · by kind", kind: "words" },
    sort: { text: "newest first", kind: "words" },
  },
};

/** The help's title, with no address. */
export const Help: Story = {
  args: { title: { text: "help", kind: "words" } },
};

/** An editor open on an item of a repository with a long short name. */
export const Long: Story = {
  args: {
    title: {
      text: "requesting review example-repository-with-a-long-name#12345",
      kind: "identifier",
    },
  },
};
