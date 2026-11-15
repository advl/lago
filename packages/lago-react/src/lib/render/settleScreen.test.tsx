import { afterEach, describe, expect, it, vi } from "vitest";
import Countdown from "../../../testing/Countdown.js";
import Restless from "../../../testing/Restless.js";
import Soon from "../../../testing/Soon.js";
import render from "./render.js";

describe("settleScreen", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("settles while time is stopped, and fires no timer doing it", async () => {
    vi.useFakeTimers();
    const screen = await render(<Countdown />);
    await screen.settle();
    expect(screen.lines.at(0)).toBe("waiting");
    expect(vi.getTimerCount()).toBe(1);
  });

  it("fires no timer while it settles, not even one of no delay", async () => {
    vi.useFakeTimers();
    const screen = await render(<Soon />);
    await screen.settle();
    expect(screen.lines.at(0)).toBe("soon");
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(0);
    await screen.settle();
    expect(screen.lines.at(0)).toBe("now");
  });

  it("shows what a timer did once the test has moved the clock", async () => {
    vi.useFakeTimers();
    const screen = await render(<Countdown />);
    vi.advanceTimersByTime(1_000);
    await screen.settle();
    expect(screen.lines.at(0)).toBe("done");
  });

  it("gives up on a screen that asks for a new frame on every frame", async () => {
    await expect(render(<Restless />)).rejects.toThrow(
      "The screen did not settle in 100 frames: something asks for a new frame on every frame.",
    );
  });
});
