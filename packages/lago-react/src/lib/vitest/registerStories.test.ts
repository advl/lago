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

  it("refuses a global a plugin declares and the project's preview declares too, naming both", () => {
    const scheme = { values: ["light", "dark"], default: "light" };
    expect(() =>
      registerStories(
        module,
        import.meta.url,
        {
          viewports: { narrow: { cols: 20, rows: 1 } },
          comments: {},
          preview: "/p/lago.preview.tsx",
          plugins: [{ name: "schemes", globalTypes: { scheme } }],
        },
        { default: { globalTypes: { scheme } } },
        [undefined],
      ),
    ).toThrow(
      "The global scheme is declared by both the plugin schemes and the preview /p/lago.preview.tsx. A global is declared once: leave it to one of them.",
    );
  });

  it("refuses a mode that sets a global no plugin's preview nor the project's declares", () => {
    expect(() =>
      registerStories(
        module,
        import.meta.url,
        {
          viewports: { narrow: { cols: 20, rows: 1 } },
          comments: {},
          modes: { dim: { globals: { tint: "dim" } } },
          plugins: [{ name: "schemes", preview: "/plugin/preview.js" }],
        },
        undefined,
        [
          {
            default: {
              globalTypes: { scheme: { values: ["light"], default: "light" } },
            },
          },
        ],
      ),
    ).toThrow(
      `The mode dim sets the global "tint", which the preview does not declare: it declares scheme.`,
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
