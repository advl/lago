import { describe, expect, it } from "vitest";
import prepareStory from "./prepareStory.js";
import runStory from "./runStory.js";
import type {
  Decorator,
  Globals,
  Loader,
  PlayContext,
  StoryContext,
} from "./types.js";

const globalTypes = {
  scheme: { values: ["light", "dark", "dim"], default: "light" },
  density: { values: ["compact", "roomy"], default: "roomy" },
  glyphs: { values: ["unicode", "ascii"], default: "unicode" },
};

/** A line naming every global, in a fixed order. */
const writeGlobals = ({ scheme, density, glyphs }: Globals) =>
  `${scheme} ${density} ${glyphs}`;

describe("runStory", () => {
  it("gives the render, the decorators, the loaders and the play the story's globals, then the mode's, then the defaults", async () => {
    const seen: string[] = [];
    const load: Loader = ({ globals }) => {
      seen.push(`loader ${writeGlobals(globals)}`);
    };
    const decorate: Decorator = (Story, { globals }) => {
      seen.push(`decorator ${writeGlobals(globals)}`);
      return Story();
    };
    const story = prepareStory(
      { title: "fixtures/Globals", globals: { scheme: "dark" } },
      "Fixed",
      {
        globals: { scheme: "dim" },
        loaders: [load],
        decorators: [decorate],
        render: (_args: unknown, { globals }: StoryContext) => (
          <text>{writeGlobals(globals)}</text>
        ),
        play: ({ globals }: PlayContext) => {
          seen.push(`play ${writeGlobals(globals)}`);
        },
      },
      { globalTypes },
    );
    const screen = await runStory(
      story,
      { cols: 20, rows: 1 },
      { scheme: "light", density: "compact" },
    );
    expect(screen.lines).toEqual(["dim compact unicode"]);
    expect([...new Set(seen)]).toEqual([
      "loader dim compact unicode",
      "decorator dim compact unicode",
      "play dim compact unicode",
    ]);
  });

  it("gives each global its default, or the story's, in no mode", async () => {
    const story = prepareStory(
      { title: "fixtures/Globals" },
      "Plain",
      {
        globals: { glyphs: "ascii" },
        render: (_args: unknown, { globals }: StoryContext) => (
          <text>{writeGlobals(globals)}</text>
        ),
      },
      { globalTypes },
    );
    expect((await runStory(story, { cols: 20, rows: 1 })).lines).toEqual([
      "light roomy ascii",
    ]);
  });
});
