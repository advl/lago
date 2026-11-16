import { describe, expect, it } from "vitest";
import createEmulator from "./createEmulator.js";

describe("createEmulator", () => {
  it("says it is still reading until every byte written has been read", async () => {
    const emulator = createEmulator({ cols: 10, rows: 2 });
    const first = emulator.write("one");
    const second = emulator.write(" two");
    expect(emulator.isReading()).toBe(true);
    await first;
    await second;
    expect(emulator.isReading()).toBe(false);
    expect(emulator.read().lines.at(0)?.at(0)?.text).toBe("one two");
    emulator.dispose();
  });

  it("keeps what it has read between writes, as a terminal keeps its screen", async () => {
    const emulator = createEmulator({ cols: 10, rows: 2 });
    await emulator.write("top\n");
    await emulator.write("bottom");
    expect(emulator.read().lines.map((line) => line.at(0)?.text)).toEqual([
      "top",
      "bottom",
    ]);
    emulator.dispose();
  });
});
