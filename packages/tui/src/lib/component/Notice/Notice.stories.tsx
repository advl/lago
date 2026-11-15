import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./Notice.js";

const meta = {
  title: "component/Notice",
  component: Component,
  args: {
    reason: "the tool needs git",
    recovery: "install it from https://git.example.com, then run git init",
    width: 40,
  },
  render: (args, { viewport }) => <Component {...args} width={viewport.cols} />,
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A tool the application needs is missing. */
export const ToolMissing: Story = {};

/** The tool is there but not set up. */
export const NotSetUp: Story = {
  args: {
    reason: "git has no user name configured",
    recovery: "run git config user.name",
  },
};

/** A failure no code names stopped the application. */
export const UnexpectedFailure: Story = {
  args: {
    reason: "the tool stopped on a failure it has no name for: disk on fire",
    recovery: "run the command again; if it keeps failing, report it",
  },
};

/** A refusal with a reason longer than the pane. */
export const Long: Story = {
  args: {
    reason:
      "the service refused the request: reviews may only be requested from collaborators of example-org/example-repository-with-a-long-name.",
    recovery:
      "change what the service's reason names, then close the editor with esc, refresh with R, then open it again with r",
  },
};
