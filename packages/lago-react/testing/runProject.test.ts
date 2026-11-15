import { describe, expect, it } from "vitest";
import runProject from "./runProject.js";

const files = {
  "Label.tsx":
    "export default function Label() {\n  return <text>hello</text>;\n}\n",
  "Label.stories.tsx":
    'import Component from "./Label.js";\n\nexport default { title: "scratch/Label", component: Component };\n\nexport const Hello = {};\n',
};

describe("runProject", { timeout: 60_000 }, () => {
  it("runs as on a person's machine, whatever pipeline runs it, and keeps vitest's cache in the project", async () => {
    const before = process.env.GITHUB_ACTIONS;
    process.env.GITHUB_ACTIONS = "true";
    try {
      const run = await runProject(files);
      expect(run.outcomes.map(({ status }) => status)).toEqual([
        "passed",
        "passed",
      ]);
      expect(run.exists("__goldens__/Label.Hello.small.golden")).toBe(true);
      expect(run.exists(".vitest-cache")).toBe(true);
    } finally {
      if (before === undefined) delete process.env.GITHUB_ACTIONS;
      else process.env.GITHUB_ACTIONS = before;
    }
  });

  it("runs as a pipeline when asked, where a missing golden fails", async () => {
    const run = await runProject(files, "--ci");
    expect(run.outcomes.map(({ status }) => status)).toEqual([
      "failed",
      "passed",
    ]);
  });
});
