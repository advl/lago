import { describe, expect, it } from "vitest";
import chooseArrangement from "./chooseArrangement.js";

describe("chooseArrangement", () => {
  it("sets stories beside each other when the two widest frames fit the room", () => {
    const extents = [
      { cols: 20, rows: 3 },
      { cols: 30, rows: 1 },
      { cols: 10, rows: 1 },
    ];
    expect(chooseArrangement(extents, 56)).toBe("beside");
    expect(chooseArrangement(extents, 55)).toBe("rows");
  });

  it("sets a lone story in rows, with room for its description", () => {
    expect(chooseArrangement([{ cols: 4, rows: 1 }], 200)).toBe("rows");
    expect(chooseArrangement([], 200)).toBe("rows");
  });
});
