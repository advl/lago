import { describe, expect, it } from "vitest";
import runProject, { configure } from "../../../testing/runProject.js";

const project = {
  "src/Label.tsx": `import { useEffect, useState } from "react";

export default function Label({ text }: { text: string }) {
  const [late, setLate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setLate(true), 1_000);
    return () => clearTimeout(timer);
  }, []);
  return <text>{late ? \`\${text}, later\` : text}</text>;
}
`,
  "src/Label.stories.tsx": `import type { Meta, StoryObj } from "@aztlan/lago-react";
import Component from "./Label.js";

const meta = {
  title: "scratch/Label",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;

/** Says hello. */
export const Hello: StoryObj<typeof meta> = { args: { text: "hello" } };
`,
  "src/Label.test.tsx": `import { composeStories, render } from "@aztlan/lago-react";
import { expect, it, vi } from "vitest";
import Label from "./Label.js";
import * as stories from "./Label.stories.js";

it("draws a component and stops its clock with the defaults", async () => {
  vi.useFakeTimers();
  const screen = await render(<Label text="hi" />, { cols: 20, rows: 1 });
  expect(screen.lines).toEqual(["hi"]);
  vi.advanceTimersByTime(1_000);
  await screen.settle();
  expect(screen.lines).toEqual(["hi, later"]);
  vi.useRealTimers();
});

it("uses a story as a fixture", async () => {
  const { Hello } = composeStories(stories);
  expect((await Hello.run({ cols: 20, rows: 1 })).lines).toEqual(["hello"]);
});
`,
};

describe("a project configured by createConfig alone", {
  timeout: 60_000,
}, () => {
  it("runs its tests and its stories, each story against a golden beside its file", async () => {
    const { outcomes, output, read } = await runProject(project);
    expect([...outcomes].sort(), output).toEqual([
      ["draws a component and stops its clock with the defaults", "passed"],
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
      ["uses a story as a fixture", "passed"],
    ]);
    expect(read("src/__goldens__/Label.Hello.small.golden")).toBe(
      '20x3\n|hello\n\n1:1 "hello" fg=#ffffff\n',
    );
  });

  it("fails a story whose picture differs from the golden beside it", async () => {
    const { outcomes } = await runProject({
      ...project,
      "src/__goldens__/Label.Hello.small.golden":
        '20x3\n|hallo\n\n1:1 "hallo" fg=#ffffff\n',
    });
    expect(
      outcomes.find(([name]) => name === "scratch/Label Hello at small"),
    ).toEqual(["scratch/Label Hello at small", "failed"]);
  });

  it("leaves the stories out of a run of the unit project", async () => {
    const { outcomes, output, exists } = await runProject(
      project,
      "--project",
      "unit",
    );
    expect(outcomes.map(([name]) => name).sort(), output).toEqual([
      "draws a component and stops its clock with the defaults",
      "uses a story as a fixture",
    ]);
    expect(exists("src/__goldens__")).toBe(false);
  });

  it("measures coverage on the unit project alone, where a line only a story draws is not covered", async () => {
    const { outcomes, output } = await runProject(
      {
        ...project,
        "src/Banner.tsx":
          "export default function Banner() {\n  return <text>only a story draws this</text>;\n}\n",
        "src/Banner.stories.tsx":
          'import Component from "./Banner.js";\n\nexport default { title: "scratch/Banner", component: Component };\n\nexport const Default = {};\n',
      },
      "--coverage",
      "--project",
      "unit",
    );
    expect(outcomes.map(([name]) => name).sort(), output).toEqual([
      "draws a component and stops its clock with the defaults",
      "uses a story as a fixture",
    ]);
    expect(output).toMatch(/Banner\.tsx\s*\|\s*0\s*\|/);
    expect(output).toContain("does not meet global threshold (100%)");
  });

  it("refuses a coverage run that would count what the stories draw", async () => {
    const { outcomes, output } = await runProject(project, "--coverage");
    expect(outcomes).toEqual([]);
    expect(output).toContain(
      "Coverage is measured on the unit project alone, so that a line a story merely draws does not count as tested.",
    );
  });

  it("sets every story inside the preview it names, and a test composing them inside the same", async () => {
    const { outcomes, output, read } = await runProject({
      ...project,
      "vitest.config.ts": configure(', preview: "./src/lago.preview.tsx"'),
      "src/lago.preview.tsx": `import type { Preview } from "@aztlan/lago-react";

const preview = {
  decorators: [
    (Story, { loaded }) => (
      <box flexDirection="column">
        <text>{String(loaded.mark)}</text>
        <Story />
      </box>
    ),
  ],
  loaders: [() => ({ mark: "framed" })],
} satisfies Preview;

export default preview;
`,
      "src/Label.test.tsx": `import { composeStories, setProjectAnnotations } from "@aztlan/lago-react";
import { expect, it } from "vitest";
import preview from "./lago.preview.js";
import * as stories from "./Label.stories.js";

setProjectAnnotations(preview);

it("draws a story as its stories file does", async () => {
  const { Hello } = composeStories(stories);
  expect((await Hello.run({ cols: 20, rows: 3 })).lines).toEqual(["framed", "hello", ""]);
});
`,
    });
    expect([...outcomes].sort(), output).toEqual([
      ["draws a story as its stories file does", "passed"],
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
    ]);
    expect(read("src/__goldens__/Label.Hello.small.golden")).toMatch(
      /^20x3\n\|framed\n\|hello\n/,
    );
  });

  it("measures coverage without the preview, which only the stories draw", async () => {
    const { outcomes, output } = await runProject(
      {
        ...project,
        "vitest.config.ts": configure(', preview: "./src/lago.preview.tsx"'),
        "src/lago.preview.tsx":
          "export default {\n  decorators: [(Story) => <box>{Story()}</box>],\n};\n",
      },
      "--coverage",
      "--project",
      "unit",
    );
    expect(
      outcomes.map(([, status]) => status),
      output,
    ).toEqual(["passed", "passed"]);
    expect(output).not.toContain("lago.preview");
    expect(output).not.toContain("does not meet global threshold");
  });

  it("draws every story in each mode it names, and prints the matrix once", async () => {
    const { outcomes, output, exists } = await runProject({
      ...project,
      "vitest.config.ts": configure(
        ', preview: "./src/lago.preview.tsx", modes: { dark: { globals: { scheme: "dark" } } }, matrix: { max: 2 }',
      ),
      "src/lago.preview.tsx": `import type { Preview } from "@aztlan/lago-react";

const preview = {
  globalTypes: { scheme: { values: ["light", "dark"], default: "light" } },
  decorators: [
    (Story, { globals }) => (
      <box flexDirection="column">
        <text>{globals.scheme}</text>
        <Story />
      </box>
    ),
  ],
} satisfies Preview;

export default preview;
`,
    });
    expect([...outcomes].sort(), output).toEqual([
      ["draws a component and stops its clock with the defaults", "passed"],
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label Hello at small@dark", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
      ["uses a story as a fixture", "passed"],
    ]);
    expect(exists("src/__goldens__/Label.Hello.small@dark.golden")).toBe(true);
    expect(output.match(/Matrix: /g)).toEqual(["Matrix: "]);
    expect(output).toContain(
      "Matrix: 2 pictures covered, 1 in the base and 1 in 1 mode: 1 distinct",
    );
  });
});
