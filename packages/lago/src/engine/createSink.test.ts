import { describe, expect, it } from "vitest";
import createSink from "./createSink.js";

describe("createSink", () => {
  it("takes whatever is written and keeps none of it", async () => {
    const sink = createSink();
    await new Promise<void>((done, fail) =>
      sink.write("a line vitest would print\n", (error) =>
        error ? fail(error) : done(),
      ),
    );
    expect(sink.writableLength).toBe(0);
  });
});
