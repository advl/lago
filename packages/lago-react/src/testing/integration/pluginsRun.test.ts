import { describe, expect, it } from "vitest";
import runProject, { configure } from "../../../testing/runProject.js";

/**
 * A plugin as a package would give it, from a module of the project: a
 * preview by its URL, a global of its own and a mode in it.
 */
const plugin = `import { definePlugin } from "@aztlan/lago-core";

export default function schemes() {
  return definePlugin({
    name: "schemes",
    preview: new URL("./preview.tsx", import.meta.url),
    globalTypes: { scheme: { values: ["light", "dark"], default: "light" } },
    modes: { dark: { globals: { scheme: "dark" } } },
  });
}
`;

const files = {
  "vitest.config.ts": configure(
    ', preview: "./lago.preview.tsx", plugins: [(await import("./plugin/index.ts")).default()]',
  ),
  "plugin/index.ts": plugin,
  "plugin/preview.tsx": `export default {
  decorators: [
    (Story, { globals }) => (
      <box flexDirection="column">
        <text>{\`plugin \${globals.scheme}\`}</text>
        {Story()}
      </box>
    ),
  ],
  parameters: { owner: "plugin" },
};
`,
  "lago.preview.tsx": `export default {
  decorators: [
    (Story, { parameters }) => (
      <box flexDirection="column">
        <text>{\`project \${parameters.owner}\`}</text>
        {Story()}
      </box>
    ),
  ],
  parameters: { owner: "project" },
};
`,
  "Label.stories.tsx": `export default { title: "scratch/Label", render: () => <text>label</text> };

export const Default = {};
`,
};

describe("a project's stories under the plugin with plugins", {
  timeout: 60_000,
}, () => {
  it("are set inside each plugin's preview, then the project's, and drawn in the plugin's modes", async () => {
    const { outcomes, output, read } = await runProject(files);
    expect(
      outcomes.map(({ name, status }) => [name, status]),
      output,
    ).toEqual([
      ["scratch/Label Default at small", "passed"],
      ["scratch/Label Default at small@dark", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
    ]);
    expect(read("__goldens__/Label.Default.small.golden")).toMatch(
      /^20x3\n\|project project\n\|plugin light\n\|label\n/,
    );
    expect(
      read("__goldens__/Label.Default.small@dark.golden").split("\n").at(2),
    ).toBe("|plugin dark");
  });

  it("refuse a global the plugin and the project's preview both declare, naming both", async () => {
    const { errors } = await runProject({
      ...files,
      "lago.preview.tsx": `export default {
  globalTypes: { scheme: { values: ["light"], default: "light" } },
};
`,
    });
    expect(errors["Label.stories.tsx"]).toContain(
      "The global scheme is declared by both the plugin schemes and the preview",
    );
  });
});
