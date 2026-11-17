import { describe, expect, it } from "vitest";
import { makeRecord } from "../../testing/records.js";
import buildCatalog from "./buildCatalog.js";
import findPicture from "./findPicture.js";

describe("findPicture", () => {
  const story = buildCatalog([
    makeRecord("component/Row", "Default", { mode: "dark" }),
    makeRecord("component/Row", "Default"),
  ])
    .groups.at(0)
    ?.components.at(0)
    ?.stories.at(0);

  it("finds a story's picture at a viewport in the base, and in a mode", () => {
    expect(findPicture(story, "narrow", undefined)?.mode).toBeUndefined();
    expect(findPicture(story, "narrow", "dark")?.mode).toBe("dark");
  });

  it("finds nothing where the story was not drawn, or for no story", () => {
    expect(findPicture(story, "wide", undefined)).toBeUndefined();
    expect(findPicture(story, "narrow", "loud")).toBeUndefined();
    expect(findPicture(undefined, "narrow", undefined)).toBeUndefined();
  });
});
