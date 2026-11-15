import { describe, expect, it } from "vitest";
import wrapNotice from "./wrapNotice.js";

describe("wrapNotice", () => {
  it("opens the reason with ✗ and the recovery with Recovery:, each wrapped", () => {
    expect(
      wrapNotice(
        "the tool needs git",
        "install it from https://git.example.com, then run git init",
        38,
      ),
    ).toEqual({
      reason: ["✗ the tool needs git"],
      recovery: [
        "Recovery: install it from",
        "https://git.example.com, then run",
        "git init",
      ],
    });
  });

  it("keeps a command whole up to a comma, and wraps the rest", () => {
    const { recovery } = wrapNotice(
      "a reason",
      "run tool show example#12, then apply again",
      24,
    );
    expect(recovery).toEqual([
      "Recovery: run",
      "tool show example#12,",
      "then apply again",
    ]);
  });
});
