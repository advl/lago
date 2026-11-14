import { describe, expect, it } from "vitest";
import findWorst from "./findWorst.js";

describe("findWorst", () => {
  it("ranks an error above a change, a change above a new picture, and that above a pass", () => {
    expect(findWorst(["pass", "new"])).toBe("new");
    expect(findWorst(["new", "changed", "pass"])).toBe("changed");
    expect(findWorst(["changed", "error"])).toBe("error");
    expect(findWorst(["pass"])).toBe("pass");
  });

  it("gives pass for nothing at all", () => {
    expect(findWorst([])).toBe("pass");
  });
});
