import { afterEach, describe, expect, it, vi } from "vitest";
import {
  changeAfter,
  countTo,
  drawLater,
  echoInput,
  showClock,
  showEnvironment,
  spin,
} from "../../../testing/mounts.js";
import renderStream from "./renderStream.js";

const environmentBefore = `${process.env.FORCE_COLOR} ${process.env.COLORTERM}`;

describe("renderStream", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("gives the screen a program draws once its timers have run, however far off", async () => {
    const screen = await renderStream(changeAfter("first", "second", 500), {
      cols: 20,
      rows: 2,
    });
    expect(screen.lines).toEqual(["second", ""]);
  });

  it("follows a chain of timers, each set by the one before, to its end", async () => {
    const screen = await renderStream(countTo(3));
    expect(screen.lines.at(0)).toBe("step 3");
  });

  it("waits for what a promise and a real turn of the event loop bring before it judges the screen quiet", async () => {
    const screen = await renderStream(drawLater);
    expect(screen.lines.at(0)).toBe("later");
  });

  it("refuses a program that never stops drawing, saying why", async () => {
    await expect(renderStream(spin)).rejects.toThrow(
      "The screen did not settle in 500 steps: a timer still waits, or the program writes on every step, as an interval or an animation does.",
    );
  });

  it("gives the same screenshot every time the same program is mounted", async () => {
    const first = await renderStream(countTo(2));
    const second = await renderStream(countTo(2));
    expect(second.screenshot()).toEqual(first.screenshot());
  });

  it("writes keys to the program's input as a terminal sends them, settling after each", async () => {
    const screen = await renderStream(echoInput);
    await screen.userEvent.keyboard("a{ArrowUp}{Control>}c{/Control}");
    expect(screen.lines.slice(0, 3)).toEqual([
      '"a"',
      '"\\u001b[A"',
      '"\\u0003"',
    ]);
  });

  it("writes a paste between the marks a terminal puts around one", async () => {
    const screen = await renderStream(echoInput);
    await screen.userEvent.paste("two words");
    expect(screen.lines.at(0)).toBe('"\\u001b[200~two words\\u001b[201~"');
  });

  it("mounts on a terminal of the size asked for, its input in raw mode, with time stopped at zero", async () => {
    const screen = await renderStream(showClock, { cols: 30, rows: 4 });
    expect(screen.lines.slice(0, 3)).toEqual(["0", "30x4 30x4", "true"]);
  });

  it("keeps the clock of a test that has faked the timers itself", async () => {
    vi.useFakeTimers({ now: 5000, toFake: ["setTimeout", "Date"] });
    const screen = await renderStream(showClock);
    expect(screen.lines.at(0)).toBe("5000");
  });

  it("refuses a test that has faked setImmediate, naming what to fake instead", async () => {
    vi.useFakeTimers({ toFake: ["setImmediate"] });
    const mount = vi.fn(showClock);
    await expect(renderStream(mount)).rejects.toThrow(
      'The screen cannot settle while setImmediate is faked: React and the programs it draws commit on it. Fake the timers a program uses and leave that one real: vi.useFakeTimers({ toFake: ["setTimeout"',
    );
    expect(mount).not.toHaveBeenCalled();
  });

  it("gives the program a terminal of full colour", async () => {
    const screen = await renderStream(showEnvironment);
    expect(screen.lines.at(0)).toBe("3 truecolor");
  });

  it("puts the environment back when the test that set it ends", () => {
    expect(`${process.env.FORCE_COLOR} ${process.env.COLORTERM}`).toBe(
      environmentBefore,
    );
  });

  it("takes the program down when unmounted, running out what still waits rather than clearing it", async () => {
    const taken = vi.fn();
    const screen = await renderStream(({ output }) => {
      output.write("up");
      return taken;
    });
    const waited = vi.fn();
    setTimeout(waited, 50);
    await screen.unmount();
    expect(taken).toHaveBeenCalledOnce();
    expect(waited).toHaveBeenCalledOnce();
  });

  it("unmounts once the clock is real again, with nothing left to run out", async () => {
    const taken = vi.fn();
    const screen = await renderStream(() => taken);
    vi.useRealTimers();
    await screen.unmount();
    expect(taken).toHaveBeenCalledOnce();
  });
});
