import type { Meta, StoryObj } from "@aztlan/lago-react";
import { longCommands, owedCommands } from "../../../../testing/commands.js";
import { EmptyState, HelpOverlay, KeyBar } from "../../component/index.js";
import { PaneHeader } from "../../subcomponent/index.js";
import { tokens } from "../../tokens/index.js";
import Component from "./Pane.js";

/** A one-line stand-in for an application's own line, such as its counts. */
const drawLine = (text: string) => (
  <text fg={tokens["color.text.muted"]}>{text}</text>
);

const meta = {
  title: "layout/Pane",
  component: Component,
  args: {
    name: "the tool",
    minColumns: 40,
    minLines: 8,
    width: 40,
    height: 36,
    header: null,
    children: null,
    keys: null,
  },
  render: (args, { viewport: { cols, rows } }) => (
    <Component
      {...args}
      width={cols}
      height={rows}
      header={
        <PaneHeader title={{ text: "owed", kind: "words" }} width={cols} />
      }
      counts={drawLine("0 over · 0 soon · 0 on track")}
      status={drawLine("synced 2m ago")}
      keys={<KeyBar commands={owedCommands} width={cols} />}
    >
      <box paddingTop={1}>
        <EmptyState
          message={{ text: "nothing owed", kind: "words" }}
          width={cols}
        />
      </box>
    </Component>
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Every line of the screen, with nothing to list. Narrower than the
 * application needs, it says only that.
 */
export const NothingOwed: Story = {
  parameters: { viewports: { tooNarrow: { cols: 32, rows: 36 } } },
};

/** The help open: it fills the pane under the header. */
export const Help: Story = {
  render: (args, { viewport: { cols, rows } }) => (
    <Component
      {...args}
      width={cols}
      height={rows}
      header={
        <PaneHeader title={{ text: "help", kind: "words" }} width={cols} />
      }
      help={
        <HelpOverlay
          commands={owedCommands}
          note={{ text: "windows are counted in working time", kind: "words" }}
          width={cols}
          height={rows - 1}
        />
      }
      keys={<KeyBar commands={owedCommands} width={cols} />}
    >
      {null}
    </Component>
  ),
};

/** No counts line: its place stays blank. */
export const NoCounts: Story = {
  render: (args, { viewport: { cols, rows } }) => (
    <Component
      {...args}
      width={cols}
      height={rows}
      header={
        <PaneHeader title={{ text: "owed", kind: "words" }} width={cols} />
      }
      status={drawLine("synced 2m ago")}
      keys={<KeyBar commands={owedCommands} width={cols} />}
    >
      <box paddingTop={1}>
        <EmptyState
          message={{ text: "nothing owed", kind: "words" }}
          width={cols}
        />
      </box>
    </Component>
  ),
};

/**
 * Every line of the pane with more than 40 columns hold: an editor's header
 * on a repository with a long short name, and more keys than the bar holds.
 */
export const Long: Story = {
  render: (args, { viewport: { cols, rows } }) => (
    <Component
      {...args}
      width={cols}
      height={rows}
      header={
        <PaneHeader
          title={{
            text: "assigning example-repository-with-a-long-name#12345",
            kind: "identifier",
          }}
          width={cols}
        />
      }
      counts={drawLine("9999 over · 9999 soon · 9999 on track")}
      status={drawLine("synced 2m ago")}
      keys={<KeyBar commands={longCommands} width={cols} />}
    >
      <box paddingTop={1}>
        <EmptyState
          message={{ text: "nothing owed", kind: "words" }}
          width={cols}
        />
      </box>
    </Component>
  ),
};
