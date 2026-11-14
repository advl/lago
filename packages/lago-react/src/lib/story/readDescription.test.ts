import { describe, expect, it } from "vitest";
import readDescription from "./readDescription.js";

describe("readDescription", () => {
  it("reads the story's description from its parameters", () => {
    const parameters = { docs: { description: { story: "Empty." } } };
    expect(readDescription(parameters)).toBe("Empty.");
  });

  it.each([
    ["no parameters about documentation", {}],
    [
      "a description of the component alone",
      { docs: { description: { component: "A box." } } },
    ],
    [
      "something else where the description would be",
      { docs: { description: { story: 4 } } },
    ],
    ["something else on the way to it", { docs: "none" }],
    ["nothing on the way to it", { docs: null }],
  ])("gives nothing for %s", (_, parameters) => {
    expect(readDescription(parameters)).toBeUndefined();
  });
});
