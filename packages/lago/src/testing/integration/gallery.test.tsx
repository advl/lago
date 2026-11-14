import { existsSync } from "node:fs";
import { join } from "node:path";
import { createTestRenderer } from "@opentui/core/testing";
import { describe, expect, it } from "vitest";
import makeProject from "../../../testing/makeProject.js";
import { openGallery } from "../../app/index.js";

type Setup = Awaited<ReturnType<typeof createTestRenderer>>;

/** Draws the renderer's frames until one shows `text`, and gives it. */
async function waitForFrame(setup: Setup, text: string): Promise<string> {
  for (let attempt = 0; attempt < 600; attempt += 1) {
    await setup.renderOnce();
    const frame = setup.captureCharFrame();
    if (frame.includes(text)) return frame;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`No frame showed ${text}.`);
}

/** Presses a key, then draws until the screen settles, and gives the frame. */
async function press(setup: Setup, key: () => void): Promise<string> {
  key();
  for (let frame = 0; frame < 5; frame += 1) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    await setup.renderOnce();
  }
  return setup.captureCharFrame();
}

const stories = {
  "src/Label.tsx":
    "export default function Label({ text }: { text: string }) {\n  return <text>{text}</text>;\n}\n",
  "src/Label.stories.tsx":
    'import Component from "./Label.js";\n\nexport default { title: "scratch/Label", component: Component };\n\nexport const Hello = { args: { text: "hello" } };\n',
};

describe("openGallery", { timeout: 60_000 }, () => {
  it("draws the gallery at once, shows the project's stories once drawn, and closes on q", async () => {
    const root = makeProject(stories);
    let setup: Setup | undefined;
    const closed = openGallery(root, async (config) => {
      setup = await createTestRenderer({
        ...config,
        width: 80,
        height: 24,
        kittyKeyboard: true,
      });
      return setup.renderer;
    });
    while (!setup) await new Promise((resolve) => setTimeout(resolve, 10));
    expect(await waitForFrame(setup, "running the stories")).toContain(
      "lago-gallery-project-",
    );
    const frame = await waitForFrame(setup, "Label");
    expect(frame).toContain("+ Label");
    expect(frame).toContain("hello");
    // Each key is read by the bindings the screen drew last, so the screen
    // is drawn again between keys, as a person's pace allows.
    const { mockInput } = setup;
    expect(await press(setup, () => mockInput.pressEnter())).toContain(
      "scratch/Label",
    );
    expect(await press(setup, () => mockInput.pressEnter())).toContain(
      "+ Hello at small · new",
    );
    await press(setup, () => mockInput.pressKey("a", { shift: true }));
    await press(setup, () => mockInput.pressKey("y"));
    await waitForFrame(setup, "accepted Hello at small");
    expect(
      existsSync(join(root, "src/__goldens__/Label.Hello.small.golden")),
    ).toBe(true);
    setup.mockInput.pressKey("q");
    expect(await closed).toBe(0);
  });

  it("closes the renderer and gives the error when the project's vitest cannot start", async () => {
    const root = makeProject({
      ...stories,
      "vitest.config.ts": 'throw new Error("a broken configuration");\n',
    });
    await expect(
      openGallery(root, (config) =>
        createTestRenderer({ ...config, width: 80, height: 24 }).then(
          ({ renderer }) => renderer,
        ),
      ),
    ).rejects.toThrow("a broken configuration");
  });
});
