import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import makeProject from "../../../testing/makeProject.js";
import type { Catalog } from "../../catalog/index.js";
import { startEngine } from "../../engine/index.js";

const files = {
  "src/Label.tsx":
    "export default function Label({ text }: { text: string }) {\n  return <text>{text}</text>;\n}\n",
  "src/Label.stories.tsx":
    'import Component from "./Label.js";\n\nexport default { title: "scratch/Label", component: Component };\n\n/** Says hello. */\nexport const Hello = { args: { text: "hello" } };\n\nexport const Bye = { args: { text: "bye" } };\n',
  "src/__goldens__/Label.Hello.small.golden":
    '20x3\n|hello\n\n1:1 "hello" fg=#ffffff\n',
  "src/Label.test.tsx":
    'import { it } from "vitest";\n\nit("is a unit test the gallery never runs", () => {});\n',
  "src/Broken.stories.tsx":
    'import Missing from "./Missing.js";\n\nexport default { title: "scratch/Broken", component: Missing };\n\nexport const Default = {};\n',
};

/** Waits for the engine's catalog after `seen` others. */
function nextCatalog(catalogs: Catalog[], seen: number): Promise<Catalog> {
  return new Promise((resolve) => {
    const look = () => {
      const next = catalogs.at(seen);
      if (next) resolve(next);
      else setTimeout(look, 20);
    };
    look();
  });
}

describe("startEngine", { timeout: 60_000 }, () => {
  it("runs a project's stories without writing, and accepts one picture on asking", async () => {
    const root = makeProject(files);
    const catalogs: Catalog[] = [];
    const engine = await startEngine({
      root,
      onCatalog: (catalog) => catalogs.push(catalog),
    });
    try {
      const first = await nextCatalog(catalogs, 0);
      const label = first.groups
        .at(0)
        ?.components.find(({ name }) => name === "Label");
      expect(label?.stories.map(({ name, status }) => [name, status])).toEqual([
        ["Hello", "pass"],
        ["Bye", "new"],
      ]);
      expect(label?.stories.at(0)?.description).toBe("Says hello.");
      expect(first.failures.map(({ file }) => file)).toEqual([
        join(root, "src/Broken.stories.tsx"),
      ]);
      expect(
        first.groups.flatMap(({ components }) =>
          components.map(({ file }) => file),
        ),
      ).toEqual([join(root, "src/Label.stories.tsx")]);
      const golden = join(root, "src/__goldens__/Label.Bye.small.golden");
      expect(existsSync(golden)).toBe(false);

      const bye = label?.stories.at(1)?.pictures.at(0);
      if (!bye) throw new Error("the run gave no picture of Bye");
      await engine.accept(bye);
      const second = await nextCatalog(catalogs, 1);
      expect(readFileSync(golden, "utf8")).toBe(bye.text);
      expect(
        second.groups.at(0)?.components.find(({ name }) => name === "Label")
          ?.status,
      ).toBe("pass");

      rmSync(join(root, "src/Broken.stories.tsx"));
      const third = await nextCatalog(catalogs, 2);
      expect(third.failures).toEqual([]);
    } finally {
      await engine.close();
    }
  });

  it("opens on an empty catalog for a project with no stories, and refuses to accept a story that was not drawn", async () => {
    const root = makeProject({});
    const catalogs: Catalog[] = [];
    const engine = await startEngine({
      root,
      onCatalog: (catalog) => catalogs.push(catalog),
    });
    try {
      expect((await nextCatalog(catalogs, 0)).groups).toEqual([]);
      await expect(
        engine.accept({
          file: join(root, "src/X.stories.tsx"),
          title: "scratch/X",
          name: "Default",
          description: undefined,
          viewportName: "small",
          status: "error",
          golden: undefined,
          actual: undefined,
          expected: undefined,
          text: undefined,
          error: "cannot draw this",
        }),
      ).rejects.toThrow("scratch/X Default at small has no picture to accept.");
    } finally {
      await engine.close();
    }
  });

  it("closes the vitest it started when the start fails, so nothing runs after", async () => {
    const root = makeProject(files);
    let calls = 0;
    await expect(
      startEngine({
        root,
        onCatalog: () => {
          calls += 1;
          throw new Error("the gallery could not take the catalog");
        },
      }),
    ).rejects.toThrow("the gallery could not take the catalog");
    writeFileSync(
      join(root, "src/Other.stories.tsx"),
      files["src/Label.stories.tsx"].replace("scratch/Label", "scratch/Other"),
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(calls).toBe(1);
  });
});
