import { describe, expect, it } from "vitest";
import runLoaders from "./runLoaders.js";
import type { Loader } from "./types.js";

const context = {
  title: "fixtures/Loaded",
  name: "Default",
  args: { label: "apples" },
  parameters: { seed: 3 },
  viewport: { cols: 20, rows: 2 },
};

describe("runLoaders", () => {
  it("merges what the loaders give in their order, a later value winning under the same name", async () => {
    const loaders: Loader[] = [
      () => ({ user: "ada", count: 1 }),
      async () => ({ count: 2 }),
    ];
    expect(await runLoaders(loaders, context)).toEqual({
      user: "ada",
      count: 2,
    });
  });

  it("gives each loader the story's context, and takes a loader that gives nothing", async () => {
    const seen: unknown[] = [];
    const loaded = await runLoaders(
      [
        (given) => {
          seen.push(given);
        },
      ],
      context,
    );
    expect(seen).toEqual([context]);
    expect(loaded).toEqual({});
  });

  it("runs each loader once the one before it has finished, so it reads what that one set up", async () => {
    const store: string[] = [];
    const loaded = await runLoaders(
      [
        async () => {
          await Promise.resolve();
          store.push("seeded");
        },
        () => ({ seen: [...store] }),
      ],
      context,
    );
    expect(loaded).toEqual({ seen: ["seeded"] });
  });
});
