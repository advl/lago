import { describe, expect, it } from "vitest";
import readArguments from "./readArguments.js";

describe("readArguments", () => {
  it("opens the folder named, resolved against the folder called from, or that folder itself", () => {
    expect(readArguments([], "/work")).toEqual({ kind: "open", root: "/work" });
    expect(readArguments(["app"], "/work")).toEqual({
      kind: "open",
      root: "/work/app",
    });
    expect(readArguments(["/elsewhere"], "/work")).toEqual({
      kind: "open",
      root: "/elsewhere",
    });
  });

  it("prints the help or the version for their options, alone", () => {
    for (const option of ["-h", "--help"]) {
      expect(readArguments([option], "/work")).toEqual({ kind: "help" });
    }
    for (const option of ["-v", "--version"]) {
      expect(readArguments([option], "/work")).toEqual({ kind: "version" });
    }
  });

  it("refuses an unknown option, an option with anything else, and a second folder, saying why", () => {
    expect(readArguments(["--watch"], "/work")).toEqual({
      kind: "refused",
      reason: "unknown option --watch",
    });
    expect(readArguments(["--help", "app"], "/work")).toEqual({
      kind: "refused",
      reason: "--help takes nothing else",
    });
    expect(readArguments(["one", "two"], "/work")).toEqual({
      kind: "refused",
      reason: "takes one project folder",
    });
  });
});
