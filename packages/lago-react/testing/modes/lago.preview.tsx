import type { Preview } from "../../src/index.js";

/** The preview of the modes' fixtures: one global, a scheme, light unless set. */
const preview = {
  globalTypes: {
    scheme: { values: ["light", "dark"], default: "light" },
  },
} satisfies Preview;

export default preview;
