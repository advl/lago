import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { formatGolden, parseGolden } from "@aztlan/lago-core";
import { describe, expect, it } from "vitest";

describe("the goldens this package keeps", () => {
  it("read as screenshots and write back as they are", () => {
    const folder = join(import.meta.dirname, "__goldens__");
    const goldens = readdirSync(folder).filter((name) =>
      name.endsWith(".golden"),
    );
    expect(goldens.length).toBeGreaterThan(0);
    for (const name of goldens) {
      const text = readFileSync(join(folder, name), "utf8");
      expect(formatGolden(parseGolden(text)), name).toBe(text);
    }
  });
});
