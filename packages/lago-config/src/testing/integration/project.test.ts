import { describe, expect, it } from "vitest";
import runProject from "../../../testing/runProject.js";

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
});
