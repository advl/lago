import { describe, expect, it } from "vitest";
import listStories from "./listStories.js";
import type { StoriesModule } from "./types.js";

const render = () => null;

describe("listStories", () => {
  it("prepares every named export as a story of the default export", () => {
    const module: StoriesModule = {
      default: { title: "fixtures/Label", render },
      First: {},
      Second: { args: { text: "two" } },
    };
    expect(
      listStories(module, "the module").map(({ title, name, args }) => [
        title,
        name,
        args,
      ]),
    ).toEqual([
      ["fixtures/Label", "First", {}],
      ["fixtures/Label", "Second", { text: "two" }],
    ]);
  });

  it.each([
    ["no default export", {}],
    ["a default export without a title", { default: { render } }],
    ["an empty title", { default: { title: "", render } }],
  ])("refuses a module with %s, naming it", (_, module) => {
    expect(() =>
      listStories(module as unknown as StoriesModule, "src/Label.stories.tsx"),
    ).toThrow(
      'src/Label.stories.tsx has no title. Its default export must give one, as in title: "components/SearchBox".',
    );
  });
});
