import { describe, expect, it } from "vitest";
import readFailure from "./readFailure.js";
import type { ReportedTest } from "./types.js";

const orphans: ReportedTest = {
  name: "keeps no golden that no story owns",
  suite: "component/Row",
  file: "/project/src/Row.stories.tsx",
  state: "failed",
  errors: [{ message: "__goldens__ holds goldens that no story owns" }],
  story: undefined,
};

describe("readFailure", () => {
  it("gives the error that kept a file from loading", () => {
    expect(
      readFailure(
        "/project/src/Row.stories.tsx",
        [{ message: "cannot import" }],
        [],
      ),
    ).toEqual({
      file: "/project/src/Row.stories.tsx",
      message: "cannot import",
    });
  });

  it("gives every error that kept a file from loading, in order", () => {
    expect(
      readFailure(
        orphans.file,
        [{ message: "cannot import" }, { message: "and cannot parse" }],
        [orphans],
      )?.message,
    ).toBe("cannot import\n\nand cannot parse");
  });

  it("gives a failed check that the file's goldens all have a story", () => {
    expect(readFailure(orphans.file, [], [orphans])).toEqual({
      file: orphans.file,
      message: "__goldens__ holds goldens that no story owns",
    });
  });

  it("gives nothing for a file whose goldens are all owned", () => {
    expect(
      readFailure(
        orphans.file,
        [],
        [{ ...orphans, state: "passed", errors: [] }],
      ),
    ).toBeUndefined();
    expect(readFailure(orphans.file, [], [])).toBeUndefined();
  });
});
