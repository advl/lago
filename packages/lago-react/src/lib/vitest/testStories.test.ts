import { describe, expect, it } from "vitest";
import testStories from "./testStories.js";

const viewports = { narrow: { cols: 40, rows: 36 } };

/** Calls one of the plugin's hooks as vitest would. */
function callHook(
  plugin: ReturnType<typeof testStories>,
  hook: "transform" | "configureVitest",
  ...given: unknown[]
): unknown {
  return (plugin[hook] as (...given: unknown[]) => unknown)(...given);
}

describe("testStories", () => {
  it("makes a stories file register its stories, with the viewports and the comment above each", () => {
    const plugin = testStories({ viewports });
    const code = "/** Empty. */\nexport const Default = {};\n";
    const result = callHook(
      plugin,
      "transform",
      code,
      "/project/src/Row.stories.tsx?v=1",
    );
    expect(result).toEqual({
      code: [
        code,
        'import * as __lagoStories from "/project/src/Row.stories.tsx";',
        `import __lagoRegisterStories from "${import.meta.dirname}/registerStories.ts";`,
        '__lagoRegisterStories(__lagoStories, import.meta.url, {"viewports":{"narrow":{"cols":40,"rows":36}},"comments":{"Default":"Empty."}});',
        "",
      ].join("\n"),
      map: null,
    });
  });

  it("leaves every other file as it is", () => {
    const plugin = testStories({ viewports });
    expect(
      callHook(plugin, "transform", "export {};", "/project/src/Row.tsx"),
    ).toBeNull();
    expect(
      callHook(plugin, "transform", "export {};", "/project/src/Row.test.tsx"),
    ).toBeNull();
  });

  it("draws every story on 80 columns and 24 lines when it is given no viewports", () => {
    const result = callHook(
      testStories(),
      "transform",
      "",
      "/project/Row.stories.tsx",
    );
    expect(result).toMatchObject({
      code: expect.stringContaining(
        '{"viewports":{"80x24":{"cols":80,"rows":24}}',
      ),
    });
  });

  it("has vitest transform a stories file again when its viewports change, and keys no other file", () => {
    const plugin = testStories({ viewports });
    let readKey = (_: { id: string }): unknown => "never defined";
    callHook(plugin, "configureVitest", {
      defineCacheKeyGenerator: (generator: typeof readKey) => {
        readKey = generator;
      },
    });
    expect(readKey({ id: "/project/Row.stories.tsx?v=1" })).toBe(
      '{"narrow":{"cols":40,"rows":36}}',
    );
    expect(readKey({ id: "/project/Row.tsx" })).toBeUndefined();
  });

  it("refuses an empty set of viewports", () => {
    expect(() => testStories({ viewports: {} })).toThrow(
      "testStories was given an empty set of viewports. Give at least one, as in viewports: { narrow: { cols: 40, rows: 36 } }, or none for 80 by 24.",
    );
  });

  it("refuses a viewport whose name cannot be part of a file's name", () => {
    expect(() =>
      testStories({ viewports: { "40.cols": { cols: 40, rows: 36 } } }),
    ).toThrow(
      'The viewport name "40.cols" cannot be part of a file\'s name. Use letters, digits, - and _.',
    );
  });
});
