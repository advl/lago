import { describe, expect, it } from "vitest";
import runProject, { entry } from "../../../testing/runProject.js";

const label = `export default function Label({ text }: { text: string }) {
  return <text>{text}</text>;
}
`;

const stories = `import Component from "./Label.js";

export default { title: "scratch/Label", component: Component };

/** Says hello. */
export const Hello = { args: { text: "hello" } };

/** Overruled by its parameter. */
export const Bye = {
  args: { text: "bye" },
  parameters: { docs: { description: { story: "Says goodbye." } } },
};
`;

const helloGolden = '20x3\n|hello\n\n1:1 "hello" fg=#ffffff\n';
const byeGolden = '20x3\n|bye\n\n1:1 "bye" fg=#ffffff\n';

const project = {
  "Label.tsx": label,
  "Label.stories.tsx": stories,
  "__goldens__/Label.Hello.small.golden": helloGolden,
  "__goldens__/Label.Bye.small.golden": byeGolden,
};

describe("a project's stories under the plugin", { timeout: 60_000 }, () => {
  it("pass when every picture is its golden, and say what was drawn", async () => {
    const { outcomes, output } = await runProject(project);
    expect(
      outcomes.map(({ name, status }) => [name, status]),
      output,
    ).toEqual([
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label Bye at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
    ]);
    expect(outcomes.at(0)?.story).toMatchObject({
      title: "scratch/Label",
      name: "Hello",
      description: "Says hello.",
      viewportName: "small",
      text: helloGolden,
      actual: { cols: 20, rows: 3 },
      expected: { cols: 20, rows: 3 },
    });
    expect(outcomes.at(1)?.story?.description).toBe("Says goodbye.");
  });

  it("fail the story whose picture changed, and no other", async () => {
    const { outcomes } = await runProject({
      ...project,
      "Label.stories.tsx": stories.replace('"hello"', '"hullo"'),
    });
    expect(outcomes.map(({ status }) => status)).toEqual([
      "failed",
      "passed",
      "passed",
    ]);
    const [changed] = outcomes;
    expect(changed?.failures.join("\n")).toContain(
      "Snapshot `scratch/Label > Hello at small 1` mismatched",
    );
    expect(changed?.story?.actual.lines.at(0)).toMatchObject([
      { text: "hullo" },
    ]);
    expect(changed?.story?.expected?.lines.at(0)).toMatchObject([
      { text: "hello" },
    ]);
  });

  it("write the golden of a new story on a person's machine, and fail for the lack of it in a pipeline", async () => {
    const { "__goldens__/Label.Bye.small.golden": _, ...withoutBye } = project;
    const pipeline = await runProject(withoutBye, "--ci");
    expect(pipeline.outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "failed",
      "passed",
    ]);
    expect(pipeline.exists("__goldens__/Label.Bye.small.golden")).toBe(false);
    expect(pipeline.outcomes.at(1)?.story?.expected).toBeUndefined();
    const local = await pipeline.again();
    expect(local.outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "passed",
      "passed",
    ]);
    expect(local.read("__goldens__/Label.Bye.small.golden")).toBe(byeGolden);
  });

  it("fail on a golden that no story owns, and remove it under -u", async () => {
    const orphan = "__goldens__/Label.Renamed.small.golden";
    const first = await runProject({ ...project, [orphan]: helloGolden });
    expect(first.outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "passed",
      "failed",
    ]);
    expect(first.outcomes.at(2)?.failures.join("\n")).toContain(
      "Label.Renamed.small.golden",
    );
    const updated = await first.again({}, "-u");
    expect(updated.outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "passed",
      "passed",
    ]);
    expect(updated.exists(orphan)).toBe(false);
    expect(updated.exists("__goldens__/Label.Hello.small.golden")).toBe(true);
  });

  it("add no test to a test that imports the stories as its fixtures", async () => {
    const { outcomes, output } = await runProject({
      ...project,
      "Label.test.tsx": `import { expect, it } from "vitest";
import { composeStories } from ${entry};
import * as stories from "./Label.stories.js";

it("uses a story", async () => {
  const { Hello } = composeStories(stories);
  expect((await Hello.run({ cols: 10, rows: 1 })).lines).toEqual(["hello"]);
});
`,
    });
    expect(
      outcomes.map(({ name, status }) => [name, status]).sort(),
      output,
    ).toEqual([
      ["scratch/Label Bye at small", "passed"],
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
      ["uses a story", "passed"],
    ]);
  });

  it("fail one file for an error in it, and run the others", async () => {
    const { outcomes, errors } = await runProject({
      ...project,
      "Broken.stories.tsx": `import Missing from "./Missing.js";

export default { title: "scratch/Broken", component: Missing };

export const Default = {};
`,
      "Untitled.stories.tsx": `import Component from "./Label.js";

export default { component: Component };

export const Default = { args: { text: "untitled" } };
`,
    });
    expect(outcomes.map(({ status }) => status)).toEqual([
      "passed",
      "passed",
      "passed",
    ]);
    expect(errors["Broken.stories.tsx"]).toContain("Missing.js");
    expect(errors["Untitled.stories.tsx"]).toContain(
      "Untitled.stories.tsx has no title. Its default export must give one",
    );
  });

  it("leave a story tagged !test out of the run, keeping its golden", async () => {
    const tagged = stories.replace(
      'args: { text: "bye" },',
      'args: { text: "bye" },\n  tags: ["!test"],',
    );
    const first = await runProject({ ...project, "Label.stories.tsx": tagged });
    expect(first.outcomes.map(({ name, status }) => [name, status])).toEqual([
      ["scratch/Label Hello at small", "passed"],
      ["scratch/Label keeps no golden that no story owns", "passed"],
    ]);
    const updated = await first.again({}, "-u");
    expect(updated.read("__goldens__/Label.Bye.small.golden")).toBe(byeGolden);
  });
});
