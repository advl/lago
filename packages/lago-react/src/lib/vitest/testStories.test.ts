import { describe, expect, it } from "vitest";
import testStories from "./testStories.js";

const viewports = { narrow: { cols: 40, rows: 36 } };

/** The project's root, as the plugin's hooks are told it. */
const environment = { config: { root: "/project" } };

/** Calls one of the plugin's hooks as vitest would, in a project at `/project`. */
function callHook(
  plugin: ReturnType<typeof testStories>,
  hook: "transform" | "configureVitest" | "configResolved",
  ...given: unknown[]
): unknown {
  return (plugin[hook] as (...given: unknown[]) => unknown).call(
    { environment },
    ...given,
  );
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

  it("makes a stories file hand the project's preview, from the project's root, to its registration", () => {
    const plugin = testStories({
      viewports,
      preview: "./src/lago.preview.tsx",
    });
    const result = callHook(
      plugin,
      "transform",
      "export const Default = {};\n",
      "/project/src/Row.stories.tsx",
    );
    expect(result).toMatchObject({
      code: expect.stringContaining(
        [
          'import * as __lagoPreview from "/project/src/lago.preview.tsx";',
          '__lagoRegisterStories(__lagoStories, import.meta.url, {"viewports":{"narrow":{"cols":40,"rows":36}},"comments":{"Default":""},"preview":"/project/src/lago.preview.tsx"}, __lagoPreview);',
        ].join("\n"),
      ),
    });
  });

  it("refuses a preview that is not a file, naming where it was looked for", () => {
    const plugin = testStories({ preview: "./src/missing.tsx" });
    expect(() =>
      callHook(plugin, "configResolved", { root: "/project" }),
    ).toThrow(
      'The preview "./src/missing.tsx" given to testStories is not a file: /project/src/missing.tsx does not exist. Name the module from the project\'s root, as in preview: "./src/lago.preview.tsx".',
    );
    expect(() =>
      callHook(plugin, "configResolved", { root: import.meta.dirname }),
    ).toThrow("is not a file");
  });

  it("takes a preview that is a file, and a project with none", () => {
    expect(() =>
      callHook(testStories({ preview: "./testStories.ts" }), "configResolved", {
        root: import.meta.dirname,
      }),
    ).not.toThrow();
    expect(() =>
      callHook(testStories(), "configResolved", { root: "/project" }),
    ).not.toThrow();
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
      '{"viewports":{"narrow":{"cols":40,"rows":36}}}',
    );
    expect(readKey({ id: "/project/Row.tsx" })).toBeUndefined();
  });

  it("has vitest transform a stories file again when its preview changes", () => {
    const readKeys = (preview?: string) => {
      let readKey = (_: { id: string }): unknown => "never defined";
      callHook(testStories({ viewports, preview }), "configureVitest", {
        defineCacheKeyGenerator: (generator: typeof readKey) => {
          readKey = generator;
        },
      });
      return readKey({ id: "/project/Row.stories.tsx" });
    };
    expect(readKeys("./one.tsx")).not.toBe(readKeys("./other.tsx"));
    expect(readKeys("./one.tsx")).not.toBe(readKeys());
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
