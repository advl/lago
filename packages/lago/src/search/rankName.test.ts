import { describe, expect, it } from "vitest";
import rankName from "./rankName.js";

describe("rankName", () => {
  it("ranks a name that starts with the query above one that holds it, and that above its letters in order", () => {
    expect(rankName("KeyBar", "key")).toBe(3);
    expect(rankName("HotKeyBar", "keyb")).toBe(2);
    expect(rankName("ScrolledList", "sclist")).toBe(1);
    expect(rankName("Pane", "zz")).toBe(0);
    expect(rankName("Pane", "eap")).toBe(0);
  });
});
