import type { Decorator, Meta, StoryObj } from "../src/index.js";
import Component from "./Counter.js";

/** Draws a rule above the story, as wide as the screen. */
const withRule: Decorator = (Story, { viewport }) => (
  <box flexDirection="column">
    <text>{"─".repeat(viewport.cols)}</text>
    <Story />
  </box>
);

const meta = {
  title: "fixtures/Counter",
  component: Component,
  args: { label: "apples" },
  parameters: { docs: { description: { component: "A counter." } } },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The counter as it mounts. */
export const Default: Story = {};

/** After two presses of `+` and one of `-`. */
export const Pressed: Story = {
  args: { start: 3 },
  play: async ({ userEvent }) => {
    await userEvent.keyboard("++-");
  },
};

export const Described: Story = {
  args: { label: "pears" },
  parameters: {
    docs: { description: { story: "Described by its parameter." } },
  },
};

export const Undescribed: Story = {
  args: { label: "limes" },
};

/** Under a rule that a decorator draws at the screen's width. */
export const Ruled: Story = {
  decorators: [withRule],
};

/** Given the screen's width by its own render. */
export const Fitted: Story = {
  args: { label: "a label longer than the narrow screen" },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
};

/** Written as a function, the first of the format's other two forms. */
export const AsFunction = () => <Component label="plums" start={7} />;

const Template = (args: { label: string; start?: number }) => (
  <Component {...args} />
);

/** Written from a bound template, the second. */
export const FromTemplate: typeof Template & Story = Template.bind({});
FromTemplate.args = { label: "figs", start: 2 };

/** On two lines of the narrow screen, and on a size of its own. */
export const Short: Story = {
  parameters: {
    viewports: { narrow: { rows: 2 }, tiny: { cols: 12, rows: 1 } },
  },
};

/** Left out of the test run by its tag. */
export const Untested: Story = {
  tags: ["!test"],
};
