/**
 * A plugin given to the project's configuration as `definePlugin` gives one,
 * whose gallery part gives a palette and a chrome, opens on the palette its
 * options name, and shows a status item that holds state.
 */
const pluginFiles: Readonly<Record<string, string>> = {
  "vitest.config.ts": `import { createConfig } from "@aztlan/lago-config";
import { mergeConfig } from "vitest/config";

const demo = {
  name: "demo",
  gallery: {
    module: new URL("./plugin/gallery.js", import.meta.url).pathname,
    options: { open: "dracula" },
  },
};

export default mergeConfig(
  createConfig({
    viewports: { small: { cols: 20, rows: 3 } },
    gallery: { chrome: "sepia" },
    plugins: [demo],
  }),
  { test: { fsModuleCachePath: ".vitest-cache" } },
);
`,
  "plugin/gallery.js": `import { tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";
import { createElement, useState } from "react";

const dracula = ["#21222c", "#ff5555", ...Array.from({ length: 14 }, () => "#f8f8f2")];

export default (options) => ({
  palettes: { dracula },
  palette: options.open,
  chromes: { sepia: { ...tokens, "color.text": RGBA.fromHex("#704214") } },
  status: [
    {
      columns: 16,
      component: function Palette({ selection }) {
        const [label] = useState(\`palette \${selection.palette}\`);
        return createElement("text", null, label);
      },
    },
  ],
});
`,
};

export default pluginFiles;
