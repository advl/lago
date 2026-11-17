import { render, type Screen } from "@aztlan/lago-react";
import { Keys } from "@aztlan/tui";
import { useKeymap } from "@opentui/keymap/react";
import { describe, expect, it } from "vitest";
import { modesCatalog, sampleCatalog } from "../../../testing/catalogs.js";
import { sampleContributions } from "../../../testing/contributions.js";
import { type Contributions, galleryKeys } from "../../plugins/index.js";
import Gallery from "./Gallery.js";

/** The gallery on the sample catalog, with what `plugins` add. */
const open = (plugins?: Contributions, cols = 100, catalog = sampleCatalog) =>
  render(
    <Keys>
      <Gallery
        catalog={catalog}
        name="project"
        onAccept={() => Promise.resolve()}
        onQuit={() => {}}
        width={cols}
        height={24}
        {...(plugins && { plugins })}
      />
    </Keys>,
    { cols, rows: 24 },
  );

const press = async (screen: Screen, keys: string) => {
  await screen.userEvent.keyboard(keys);
  return screen.lines;
};

/** The status line: the last line but the key bar. */
const status = (screen: Screen) => screen.lines.at(-2) ?? "";

describe("usePluginKeys", () => {
  it("names the palette the plugins open on, then their items, at the end of the status line", async () => {
    const screen = await open(sampleContributions);
    expect(status(screen)).toMatch(
      / · palette dracula · grid at terminal · 0 changes$/,
    );
    expect(status(screen)).toMatch(/^\/project\/src\/Broken\.stories\.tsx: /);
  });

  it("steps to the next palette with t, round, for the session", async () => {
    const screen = await open(sampleContributions);
    expect(status(await press(screen, "t").then(() => screen))).toMatch(
      / · palette iceberg · grid at terminal · 1 changes$/,
    );
    await press(screen, "t");
    expect(status(screen)).toContain("· palette terminal ·");
    await press(screen, "t");
    expect(status(screen)).toContain("· palette dracula ·");
    expect(status(screen)).toMatch(/3 changes$/);
    expect(screen.lines.at(-1)).toContain("t palette");
  });

  it("runs a plugin's key with what is selected, a palette it chooses, and a message it says", async () => {
    const screen = await open(sampleContributions);
    await press(screen, "g");
    expect(status(screen)).toMatch(
      /^component\/KeyBar none terminal base dracula of 3 +· palette dracula/,
    );
    await press(screen, "{Enter}j{Shift>}g{/Shift}");
    expect(status(screen)).toContain("· palette iceberg ·");
    await press(screen, "g");
    expect(status(screen)).toMatch(
      /^component\/KeyBar Long terminal base iceberg of 3 +· /,
    );
    await press(screen, "{Control>}g{/Control}");
    expect(status(screen)).toMatch(/^there is no palette sepia/);
    await press(screen, "t");
    expect(status(screen)).not.toContain("there is no palette");
    await press(screen, "{Control>}f{/Control}");
    expect(status(screen)).toMatch(
      /^the plugin probe's ctrl\+f failed: the probe broke/,
    );
  });

  it("tells a plugin's key the mode shown, after the size and the mode the status line names", async () => {
    const screen = await open(sampleContributions, 120, modesCatalog);
    expect(status(screen)).toMatch(/ · base · palette dracula · grid at /);
    await press(screen, "mg");
    expect(status(screen)).toMatch(/ dark dracula of 3 /);
  });

  it("acts on no plugin key while the filter is typed, and lists the plugin's keys in the help under its name", async () => {
    const screen = await open(sampleContributions);
    await press(screen, "/gt");
    expect(status(screen)).toMatch(/^filter: gt/);
    expect(status(screen)).toContain("· palette dracula ·");
    await press(screen, "{Escape}?");
    const seen = [...screen.lines];
    for (let step = 0; step < 12; step += 1) {
      seen.push(...(await press(screen, "jjj")));
    }
    const help = seen.join("\n");
    expect(help).toMatch(/probe ─/);
    expect(help).toContain("say what is selected");
    expect(help).toContain("step to the next palette");
  });

  it("leaves the gallery as it was without plugins: no t, and nothing after the status line's words", async () => {
    const plain = await open(undefined, 80);
    const none = await open(
      {
        ...sampleContributions,
        palettes: sampleContributions.palettes.slice(0, 1),
        palette: "terminal",
        keys: [],
        status: [],
      },
      80,
    );
    expect(none.lines).toEqual(plain.lines);
    expect(status(plain)).not.toContain("palette");
    await press(plain, "t");
    expect(status(plain)).not.toContain("palette");
  });

  it("leaves out the items that would pass their share of the status line", async () => {
    const screen = await open(sampleContributions, 80);
    expect(status(screen)).toMatch(/ · palette dracula · grid at terminal$/);
  });

  it("binds no key of its own that galleryKeys, which plugins may not take, leaves out", async () => {
    let keymap: ReturnType<typeof useKeymap> | undefined;
    function Probe() {
      keymap = useKeymap();
      return null;
    }
    const screen = await render(
      <Keys>
        <Gallery
          catalog={modesCatalog}
          name="project"
          onAccept={() => Promise.resolve()}
          onQuit={() => {}}
          width={80}
          height={24}
          plugins={{ ...sampleContributions, keys: [] }}
        />
        <Probe />
      </Keys>,
      { cols: 80, rows: 24 },
    );
    await press(screen, "{Enter}");
    const bound = (
      keymap?.getCommandEntries({ visibility: "registered" }) ?? []
    )
      .flatMap(({ bindings }) => bindings)
      .map(({ sequence }) =>
        sequence
          .map(({ stroke }) =>
            [
              ...(stroke.ctrl ? ["ctrl"] : []),
              ...(stroke.shift ? ["shift"] : []),
              stroke.name,
            ].join("+"),
          )
          .join(" "),
      );
    // A project with modes binds m and x, and one with palettes t.
    expect(bound).toEqual(expect.arrayContaining(["t", "m", "x"]));
    expect(bound.filter((key) => !galleryKeys.includes(key))).toEqual([]);
  });
});
