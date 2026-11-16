import { describe, expect, it } from "vitest";
import runProject, { configure } from "../../../testing/runProject.js";

const label = `export default function Label({ text }: { text: string }) {
  return <text>{text}</text>;
}
`;

const moded = {
  "vitest.config.ts": configure(
    ', preview: "./lago.preview.tsx", modes: { dark: { globals: { scheme: "dark" }, expect: { tags: ["schemed"] } } }',
  ),
  "lago.preview.tsx": `export default {
  globalTypes: { scheme: { values: ["light", "dark"], default: "light" } },
};
`,
  "Label.tsx": label,
  "Label.stories.tsx": `import Component from "./Label.js";

export default { title: "scratch/Label", component: Component };

/** Reads no global. */
export const Plain = { args: { text: "plain" } };

/** Names its scheme. */
export const Schemed = {
  tags: ["schemed"],
  render: (_args, { globals }) => <Component text={globals.scheme} />,
};
`,
};

const darkGolden = "__goldens__/Label.Schemed.small@dark.golden";
const equalGolden = "__goldens__/Label.Plain.small@dark.golden";

describe("a project's stories under the plugin with modes", {
  timeout: 60_000,
}, () => {
  it("draw each story in each mode after its base, keeping a golden only where the picture differs", async () => {
    const { outcomes, output, read, exists } = await runProject(moded);
    expect(
      outcomes.map(({ name, status }) => [name, status]),
      output,
    ).toEqual([
      ["scratch/Label Plain at small", "passed"],
      ["scratch/Label Plain at small@dark", "passed"],
      ["scratch/Label Schemed at small", "passed"],
      ["scratch/Label Schemed at small@dark", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
    ]);
    expect(outcomes.at(0)?.story).toMatchObject({
      globals: { scheme: "light" },
    });
    expect(outcomes.at(0)?.story?.mode).toBeUndefined();
    expect(outcomes.at(1)?.story).toMatchObject({
      mode: "dark",
      viewportName: "small",
      globals: { scheme: "dark" },
      comparison: { equal: true, expectedToDiffer: false },
    });
    expect(outcomes.at(1)?.story?.expected).toBeUndefined();
    expect(outcomes.at(3)?.story).toMatchObject({
      mode: "dark",
      comparison: { equal: false, expectedToDiffer: true },
    });
    expect(exists(equalGolden)).toBe(false);
    expect(read(darkGolden)).toContain("|dark\n");
    expect(read("__goldens__/Label.Schemed.small.golden")).toContain(
      "|light\n",
    );
  });

  it("fail a pipeline for a mode's missing golden, as for any", async () => {
    const { outcomes, exists } = await runProject(moded, "--ci");
    expect(outcomes.map(({ name, status }) => [name, status]).at(3)).toEqual([
      "scratch/Label Schemed at small@dark",
      "failed",
    ]);
    expect(exists(darkGolden)).toBe(false);
  });

  it("fail on a golden kept for a mode's picture equal to the base's, and remove it under -u", async () => {
    const first = await runProject({ ...moded, [equalGolden]: "stale\n" });
    expect(first.outcomes.at(4)?.status).toBe("failed");
    expect(first.outcomes.at(4)?.failures.join("\n")).toContain(
      "Label.Plain.small@dark.golden",
    );
    const updated = await first.again({}, "-u");
    expect(updated.outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "passed",
      "passed",
      "passed",
      "passed",
    ]);
    expect(updated.exists(equalGolden)).toBe(false);
    expect(updated.exists(darkGolden)).toBe(true);
  });

  it("fail a story the mode expects to change that draws the base picture, naming the mode", async () => {
    const { outcomes } = await runProject({
      ...moded,
      "Label.stories.tsx": moded["Label.stories.tsx"].replace(
        'export const Plain = { args: { text: "plain" } };',
        'export const Plain = { args: { text: "plain" }, tags: ["schemed"] };',
      ),
    });
    const plain = outcomes.at(1);
    expect(plain?.status).toBe("failed");
    expect(plain?.failures.join("\n")).toContain(
      "The mode dark expects to change the stories tagged schemed, but scratch/Label Plain at small draws the base picture: scheme dark did not reach the story.",
    );
    expect(plain?.story?.comparison).toEqual({
      equal: true,
      expectedToDiffer: true,
    });
  });

  it("leave out a mode a story disables, its golden no longer owned", async () => {
    const { outcomes } = await runProject({
      ...moded,
      [darkGolden]: "stale\n",
      "Label.stories.tsx": moded["Label.stories.tsx"].replace(
        'tags: ["schemed"],',
        'tags: ["schemed"],\n  parameters: { modes: { dark: { disable: true } } },',
      ),
    });
    expect(outcomes.map(({ name, status }) => [name, status])).toEqual([
      ["scratch/Label Plain at small", "passed"],
      ["scratch/Label Plain at small@dark", "passed"],
      ["scratch/Label Schemed at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "failed"],
    ]);
  });

  it("compare a mode's picture with the base when the run leaves the base's test out", async () => {
    const { outcomes, output } = await runProject(moded, "-t", "@dark");
    expect(
      outcomes
        .filter(({ status }) => status !== "skipped")
        .map(({ name, status, story }) => [
          name,
          status,
          story?.comparison?.equal,
        ]),
      output,
    ).toEqual([
      ["scratch/Label Plain at small@dark", "passed", true],
      ["scratch/Label Schemed at small@dark", "passed", false],
    ]);
  });

  it("fail every stories file for a mode that sets a global the preview does not declare", async () => {
    const { outcomes, errors } = await runProject({
      ...moded,
      "vitest.config.ts": configure(
        ', preview: "./lago.preview.tsx", modes: { dim: { globals: { light: "dim" } } }',
      ),
    });
    expect(outcomes).toEqual([]);
    expect(errors["Label.stories.tsx"]).toContain(
      'The mode dim sets the global "light", which the preview does not declare: it declares scheme.',
    );
  });
});
