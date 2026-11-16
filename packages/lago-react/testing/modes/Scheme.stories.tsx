import type { Meta, StoryObj } from "../../src/index.js";
import Component from "../Counter.js";

const meta = {
  title: "fixtures/Scheme",
  component: Component,
  args: { label: "apples" },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Reads no global, so every mode draws it as the base does. */
export const Plain: Story = {};

/** Names the scheme it is drawn in, so the dark mode changes it. */
export const Named: Story = {
  tags: ["schemed"],
  render: (args, { globals }) => (
    <Component {...args} label={globals.scheme ?? ""} />
  ),
};

/** Fixed in the dark scheme, so the dark mode draws it as the base does. */
export const Fixed: Story = {
  globals: { scheme: "dark" },
  render: (args, { globals }) => (
    <Component {...args} label={globals.scheme ?? ""} />
  ),
};

/** Left out of the dark mode. */
export const Undarkened: Story = {
  parameters: { modes: { dark: { disable: true } } },
};

/** Left out of the test run by its tag, in every mode. */
export const Untested: Story = {
  tags: ["!test"],
};
