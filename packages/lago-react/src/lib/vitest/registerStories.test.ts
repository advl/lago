import { describe, expect, it } from "vitest";
import registerStories from "./registerStories.js";

const module = { default: { title: "fixtures/Plain", render: () => null } };

describe("registerStories", () => {
  it("refuses a mode that sets a global, in a project whose preview declares none", () => {
    expect(() =>
      registerStories(module, import.meta.url, {
        viewports: { narrow: { cols: 20, rows: 1 } },
        comments: {},
        modes: { dim: { globals: { scheme: "dim" } } },
      }),
    ).toThrow(
      `The mode dim sets the global "scheme", which the preview does not declare: it declares none: declare each in the preview's globalTypes.`,
    );
  });

  it("registers nothing for a file vitest is not running", () => {
    expect(() =>
      registerStories(module, "file:///project/src/Other.stories.tsx", {
        viewports: {},
        comments: {},
        modes: { dim: { globals: { scheme: "dim" } } },
      }),
    ).not.toThrow();
  });
});
