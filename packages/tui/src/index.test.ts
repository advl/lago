import { describe, expect, it } from "vitest";

describe("the package's entry", () => {
  it("exports the values an application and the gallery both use, and no other", async () => {
    expect(Object.keys(await import("./index.js")).sort()).toEqual([
      "EmptyState",
      "GroupHeading",
      "HelpOverlay",
      "KeyBar",
      "Keys",
      "Loading",
      "Notice",
      "PaneHeader",
      "ScrolledList",
      "createKeymap",
      "endRuns",
      "fitBlock",
      "fitField",
      "fitRules",
      "fitRuns",
      "giveWay",
      "measurePieces",
      "measureText",
      "noBreakSpace",
      "tokens",
      "useCommands",
      "useListScroll",
    ]);
  });
});
