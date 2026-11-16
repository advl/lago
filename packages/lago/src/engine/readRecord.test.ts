import { describe, expect, it } from "vitest";
import { drawPicture } from "../../testing/records.js";
import readRecord from "./readRecord.js";
import type { ReportedTest } from "./types.js";

const story = {
  file: "/project/src/Row.stories.tsx",
  title: "component/Row",
  name: "Default",
  description: "A row.",
  tags: ["dev", "test"],
  viewportName: "narrow",
  globals: {},
  golden: "/project/src/__goldens__/Row.Default.narrow.golden",
  actual: drawPicture(["row"]),
  text: '40x1\n|row\n\n1:1 "row"\n',
  expected: drawPicture(["row"]),
};

const test: ReportedTest = {
  name: "Default at narrow",
  suite: "component/Row",
  file: "/project/src/Row.stories.tsx",
  state: "passed",
  errors: [],
  story,
};

const exists = (path: string) => path === story.golden;

describe("readRecord", () => {
  it("reads a story that passed as a pass, with what it drew", () => {
    expect(readRecord(test, "/project", exists)).toEqual({
      file: story.file,
      title: "component/Row",
      name: "Default",
      description: "A row.",
      viewportName: "narrow",
      status: "pass",
      golden: story.golden,
      actual: story.actual,
      expected: story.expected,
      text: story.text,
      error: undefined,
    });
  });

  it("reads a drawn story that failed as changed when its golden exists, and new when not", () => {
    const failed = { ...test, state: "failed" as const };
    expect(readRecord(failed, "/project", exists)?.status).toBe("changed");
    expect(readRecord(failed, "/project", () => false)?.status).toBe("new");
  });

  it("reads a story that threw before it was drawn as an error, with the message and its place in the stories file", () => {
    const thrown: ReportedTest = {
      ...test,
      state: "failed",
      story: undefined,
      errors: [
        {
          message: "cannot draw this",
          stacks: [
            {
              file: "/project/node_modules/react/index.js",
              line: 3,
              column: 1,
            },
            { file: "/project/src/Row.stories.tsx", line: 12, column: 9 },
          ],
        },
      ],
    };
    expect(readRecord(thrown, "/project", exists)).toMatchObject({
      title: "component/Row",
      name: "Default",
      viewportName: "narrow",
      status: "error",
      error: "cannot draw this\n  at src/Row.stories.tsx:12:9",
      actual: undefined,
    });
  });

  it("places an error at its first frame when none is in the stories file, and leaves the place out when there is none", () => {
    const frame = { file: "/project/src/Row.tsx", line: 4, column: 2 };
    const elsewhere: ReportedTest = {
      ...test,
      state: "failed",
      story: undefined,
      errors: [{ message: "no", stacks: [frame] }],
    };
    expect(readRecord(elsewhere, "/project", exists)?.error).toBe(
      "no\n  at src/Row.tsx:4:2",
    );
    const bare = { ...elsewhere, errors: [{ message: "no" }] };
    expect(readRecord(bare, "/project", exists)?.error).toBe("no");
  });

  it("says a story that failed with no error did not finish", () => {
    const silent: ReportedTest = { ...test, state: "failed", story: undefined };
    expect(readRecord(silent, "/project", exists)?.error).toBe(
      "The story did not finish.",
    );
  });

  it("reads nothing from a story's test in a mode, drawn or not", () => {
    const moded = {
      ...test,
      name: "Default at narrow@dark",
      story: { ...story, mode: "dark" },
    };
    expect(readRecord(moded, "/project", exists)).toBeUndefined();
    expect(
      readRecord(
        { ...moded, state: "failed", story: undefined },
        "/project",
        exists,
      ),
    ).toBeUndefined();
  });

  it("reads nothing from a test that is no story's", () => {
    const orphans = { ...test, name: "keeps no golden that no story owns" };
    expect(readRecord(orphans, "/project", exists)).toBeUndefined();
  });
});
