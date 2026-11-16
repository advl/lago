import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import * as clockStories from "../../../testing/Clock.stories.js";
import * as stories from "../../../testing/Counter.stories.js";
import { render } from "../render/index.js";
import composeStories from "./composeStories.js";
import type { Decorator, Loader, Meta } from "./types.js";

const { Default, Pressed, Ruled, Fitted, AsFunction, FromTemplate, Untested } =
  composeStories(stories);

describe("composeStories", () => {
  it("gives every story of the module, by its export's name", () => {
    expect(Object.keys(composeStories(stories)).sort()).toEqual([
      "AsFunction",
      "Default",
      "Described",
      "Fitted",
      "FromTemplate",
      "Pressed",
      "Ruled",
      "Short",
      "Undescribed",
      "Untested",
    ]);
  });

  it("runs a story on a screen of the size asked for, played through", async () => {
    const screen = await Pressed.run({ cols: 30, rows: 2 });
    expect(screen.lines).toEqual(["apples 4", ""]);
    expect(screen.getByText("apples").attributes).toEqual(["bold"]);
  });

  it("runs a story on 80 columns and 24 lines when no size is asked for", async () => {
    const screen = await Default.run();
    expect(screen.screenshot()).toMatchObject({ cols: 80, rows: 24 });
    expect(screen.lines.at(0)).toBe("apples 0");
  });

  it("mounts a story as a component, a prop replacing the story's arg", async () => {
    const screen = await render(<Default label="cherries" start={9} />);
    expect(screen.lines.at(0)).toBe("cherries 9");
  });

  it("gives a decorator and a render the size of the screen the story is on", async () => {
    const ruled = await Ruled.run({ cols: 12, rows: 3 });
    expect(ruled.lines).toEqual(["────────────", "apples 0", ""]);
    const fitted = await Fitted.run({ cols: 12, rows: 3 });
    expect(fitted.lines.at(0)).toBe("a label  0");
  });

  it("runs the format's two other forms as it runs a story object", async () => {
    expect((await AsFunction.run()).lines.at(0)).toBe("plums 7");
    expect((await FromTemplate.run()).lines.at(0)).toBe("figs 2");
  });

  it("runs a story with time stopped at zero, as the story's own test does", async () => {
    const { AtZero, AfterASecond } = composeStories(clockStories);
    expect((await AtZero.run()).lines.at(0)).toBe("date 0 perf 0");
    expect((await AfterASecond.run()).lines.at(0)).toBe("date 1000 perf 1000");
  });

  it("keeps a composed story's state when the component around it draws again", async () => {
    function Around() {
      const [ticks, setTicks] = useState(0);
      useKeyboard((key) => {
        if (key.name === "t") setTicks((before) => before + 1);
      });
      return (
        <box flexDirection="column">
          <text>{`tick ${ticks}`}</text>
          <Default />
        </box>
      );
    }
    const screen = await render(<Around />, { cols: 20, rows: 2 });
    await screen.userEvent.keyboard("++");
    expect(screen.lines).toEqual(["tick 0", "apples 2"]);
    await screen.userEvent.keyboard("t");
    expect(screen.lines).toEqual(["tick 1", "apples 2"]);
  });

  it("runs the file's loaders, then the story's, and gives what they load to the render, the decorators and the play", async () => {
    const played: unknown[] = [];
    const framed: Decorator = (Story, { loaded }) => (
      <box flexDirection="column">
        <text>{`framed for ${String(loaded.user)}`}</text>
        <Story />
      </box>
    );
    const fromFile: Loader = ({ args, viewport }) => ({
      user: args.user,
      count: viewport.cols,
    });
    const fromStory: Loader = async () => ({ count: 7 });
    const meta: Meta = {
      title: "fixtures/Loaded",
      args: { user: "ada" },
      loaders: [fromFile],
      decorators: [framed],
      render: (_args, { loaded }) => (
        <text>{`${String(loaded.user)} has ${String(loaded.count)}`}</text>
      ),
    };
    const { Counted } = composeStories({
      default: meta,
      Counted: {
        loaders: [fromStory],
        play: ({ loaded }: { loaded: unknown }) => {
          played.push(loaded);
        },
      },
    });
    const screen = await Counted.run({ cols: 20, rows: 2 });
    expect(screen.lines).toEqual(["framed for ada", "ada has 7"]);
    expect(played).toEqual([{ user: "ada", count: 7 }]);
  });

  it("runs the loaders on the stopped clock", async () => {
    const { AtZero } = composeStories({
      default: {
        title: "fixtures/LoadedAt",
        loaders: [() => ({ at: Date.now() })],
        render: (_args, { loaded }) => <text>{`at ${String(loaded.at)}`}</text>,
      },
      AtZero: {},
    });
    expect((await AtZero.run({ cols: 10, rows: 1 })).lines).toEqual(["at 0"]);
  });

  // A loader waiting on a timer never finishes on the stopped clock, so the
  // test fails; the error that says why is read in the integration tests,
  // which run such a story in a project of its own.
  it.fails("fails a test that ends while a loader waits on a timer", {
    timeout: 100,
  }, async () => {
    const { Delayed } = composeStories({
      default: {
        title: "fixtures/Delayed",
        loaders: [() => new Promise<void>((done) => setTimeout(done, 1))],
        render: () => <text>drawn</text>,
      },
      Delayed: {},
    });
    await Delayed.run({ cols: 10, rows: 1 });
  });

  it("refuses to mount a story with loaders as a component before they are loaded, naming load", async () => {
    const { Loaded } = composeStories({
      default: {
        title: "fixtures/Loaded",
        loaders: [() => ({})],
        render: () => <text>never</text>,
      },
      Loaded: {},
    });
    await expect(render(<Loaded />)).rejects.toThrow(
      'The story "fixtures/Loaded Loaded" has loaders, which run before it is first drawn: await its load() before mounting it, or run it whole with its run().',
    );
  });

  it("mounts a story with loaders as a component once load has run them, with what they last gave", async () => {
    let count = 0;
    const seen: unknown[] = [];
    const { Loaded } = composeStories({
      default: {
        title: "fixtures/Loaded",
        args: { label: "apples" },
        loaders: [
          (context) => {
            seen.push(context.viewport);
            count += 1;
            return { count };
          },
        ],
        render: ({ label }, { loaded }) => (
          <text>{`${String(label)} ${String(loaded.count)}`}</text>
        ),
      },
      Loaded: {},
    });
    await Loaded.load();
    expect((await render(<Loaded label="plums" />)).lines.at(0)).toBe(
      "plums 1",
    );
    await Loaded.load({ cols: 30, rows: 2 });
    expect((await render(<Loaded />)).lines.at(0)).toBe("apples 2");
    expect(seen).toEqual([
      { cols: 80, rows: 24 },
      { cols: 30, rows: 2 },
    ]);
  });

  it("carries what a test may want to read of the story", () => {
    expect(Pressed.storyName).toBe("Pressed");
    expect(Pressed.args).toEqual({ label: "apples", start: 3 });
    expect(Pressed.parameters).toEqual({
      docs: { description: { component: "A counter." } },
    });
    expect(Untested.tags).toEqual(["dev"]);
  });

  it("refuses a module whose default export gives no title", () => {
    expect(() => composeStories({ default: {} as never })).toThrow(
      "The module given to composeStories has no title.",
    );
  });
});
