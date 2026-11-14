import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import flushReact from "./flushReact.js";
import render from "./render.js";

describe("flushReact", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns once React has committed what the work caused", async () => {
    let show = (_: string) => {};
    function Shown() {
      const [text, setText] = useState("before");
      show = setText;
      return <text>{text}</text>;
    }
    const screen = await render(<Shown />);
    await flushReact(() => show("after"));
    await screen.settle();
    expect(screen.lines.at(0)).toBe("after");
  });

  it("refuses, with what to fake instead, when setImmediate is faked", async () => {
    vi.useFakeTimers({ toFake: ["setImmediate"] });
    await expect(flushReact()).rejects.toThrow(
      "The screen cannot settle while setImmediate is faked, because React waits on it.",
    );
  });
});
