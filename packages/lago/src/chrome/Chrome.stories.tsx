import type { Meta, StoryObj } from "@aztlan/lago-react";
import { Keys, TokensProvider } from "@aztlan/tui";
import { sampleCatalog } from "../../testing/catalogs.js";
import { Gallery as Component } from "../ui/index.js";
import { chromes } from "./constants.js";
import type { ChromeName } from "./types.js";

/** Draws the story in the chrome `name`, as the gallery is drawn in a project's. */
const drawIn = (name: ChromeName) => ({
  decorators: [
    (Story: () => ReturnType<typeof Component>) => (
      <TokensProvider tokens={chromes[name]}>{Story()}</TokensProvider>
    ),
  ],
});

const meta = {
  title: "chrome/Gallery",
  component: Component,
  args: {
    catalog: sampleCatalog,
    name: "project",
    onAccept: () => Promise.resolve(),
    onQuit: () => {},
    width: 80,
    height: 24,
  },
  decorators: [(Story) => <Keys>{Story()}</Keys>],
  render: (args, { viewport }) => (
    <Component {...args} width={viewport.cols} height={viewport.rows} />
  ),
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The terminal's own colours, the default: every colour is the terminal's text, background or palette entry. */
export const Terminal: Story = {
  ...drawIn("terminal"),
  play: async ({ userEvent }) => {
    await userEvent.keyboard("j{Enter}j");
  },
};

/** The light chrome: the whole screen painted light, each status still marked by its glyph and its word. */
export const Light: Story = {
  ...drawIn("light"),
  play: async ({ userEvent }) => {
    await userEvent.keyboard("j{Enter}j");
  },
};

/** The light chrome on a changed picture with its golden over it, the lines marked − and +. */
export const LightGolden: Story = {
  ...drawIn("light"),
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}l{Enter}d");
  },
};

/** The dark chrome: the whole screen painted dark, each status still marked by its glyph and its word. */
export const Dark: Story = {
  ...drawIn("dark"),
  play: async ({ userEvent }) => {
    await userEvent.keyboard("j{Enter}j");
  },
};

/** The dark chrome on a changed picture with its golden over it, the lines marked − and +. */
export const DarkGolden: Story = {
  ...drawIn("dark"),
  play: async ({ userEvent }) => {
    await userEvent.keyboard("{Enter}l{Enter}d");
  },
};
