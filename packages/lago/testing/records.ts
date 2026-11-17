import type { Screenshot } from "@aztlan/lago-react";
import type { Status, StoryRecord } from "../src/catalog/index.js";

/** A picture of `lines`, each one run of default text, on a screen `cols` wide. */
export function drawPicture(lines: readonly string[], cols = 40): Screenshot {
  return {
    cols,
    rows: lines.length,
    lines: lines.map((text) =>
      text === ""
        ? []
        : [
            {
              x: 0,
              text,
              width: [...text].length,
              fg: "default" as const,
              bg: "default" as const,
              attributes: [],
            },
          ],
    ),
  };
}

/** A record of `title`'s story `name` at `viewportName`, with a picture of `lines`. */
export function makeRecord(
  title: string,
  name: string,
  overrides: Partial<StoryRecord> & { status?: Status; lines?: string[] } = {},
): StoryRecord {
  const { lines = [name], ...rest } = overrides;
  return {
    file: `/project/src/${title.split("/").at(-1)}.stories.tsx`,
    title,
    name,
    description: undefined,
    viewportName: "narrow",
    mode: undefined,
    comparison: undefined,
    globals: undefined,
    status: "pass",
    golden: `/project/src/__goldens__/${name}.narrow.golden`,
    actual: drawPicture(lines),
    expected: drawPicture(lines),
    text: lines.join("\n"),
    error: undefined,
    ...rest,
  };
}
