import { describe, expect, it } from "vitest";
import writeMatrix from "./writeMatrix.js";

describe("writeMatrix", () => {
  it("writes the whole matrix, then each mode, its name padded to the longest", () => {
    expect(
      writeMatrix({
        base: 50,
        modes: {
          dracula: { equal: 48, distinct: 2, unreached: 0, excluded: 0 },
          ascii: { equal: 47, distinct: 0, unreached: 1, excluded: 2 },
        },
      }),
    ).toEqual([
      "Matrix: 148 pictures covered, 50 in the base and 98 in 2 modes: 2 distinct · 95 equal · 1 expected but equal · 2 excluded",
      "  dracula  2 distinct · 48 equal · 0 expected but equal · 0 excluded",
      "  ascii    0 distinct · 47 equal · 1 expected but equal · 2 excluded",
    ]);
  });

  it("names one mode as one", () => {
    expect(
      writeMatrix({
        base: 1,
        modes: { dark: { equal: 1, distinct: 0, unreached: 0, excluded: 0 } },
      }).at(0),
    ).toBe(
      "Matrix: 2 pictures covered, 1 in the base and 1 in 1 mode: 0 distinct · 1 equal · 0 expected but equal · 0 excluded",
    );
  });

  it("writes nothing for a run that drew no mode", () => {
    expect(writeMatrix({ base: 4, modes: {} })).toEqual([]);
  });
});
