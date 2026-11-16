import { describe, expect, it } from "vitest";
import readPreview from "./readPreview.js";

describe("readPreview", () => {
  it("gives the preview module's default export", () => {
    const preview = { tags: ["themed"] };
    expect(readPreview({ default: preview }, "/p/lago.preview.tsx")).toBe(
      preview,
    );
  });

  it("gives nothing for a project with no preview", () => {
    expect(readPreview(undefined, undefined)).toBeUndefined();
  });

  it("refuses a preview module with no default export, naming it", () => {
    expect(() => readPreview({}, "/p/lago.preview.tsx")).toThrow(
      "The preview /p/lago.preview.tsx has no default export. Export what every story shares as its default, as in export default { decorators: [withTheme] } satisfies Preview.",
    );
    expect(() => readPreview({ default: null }, "/p/lago.preview.tsx")).toThrow(
      "has no default export",
    );
  });
});
