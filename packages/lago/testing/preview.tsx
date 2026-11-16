import type { Preview } from "@aztlan/lago-react";
import { Keys } from "@aztlan/tui";

/**
 * What every story of the gallery's screens shares: the keymap the gallery
 * mounts its screens in, so a screen binds its keys as it does when the
 * gallery runs. It sits beside the fixtures, outside what is built.
 */
const preview = {
  decorators: [(Story) => <Keys>{Story()}</Keys>],
} satisfies Preview;

export default preview;
