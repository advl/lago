import { afterEach, describe, expect, it, onTestFailed, vi } from "vitest";
import waitFor from "./waitFor.js";

describe("waitFor", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("gives what the check returns once it stops throwing", async () => {
    let tries = 0;
    const outcome = await waitFor(() => {
      tries += 1;
      if (tries < 3) throw new Error("not yet");
      return `after ${tries} tries`;
    });
    expect(outcome).toBe("after 3 tries");
  });

  it("waits for a check that is itself asynchronous", async () => {
    let tries = 0;
    const outcome = await waitFor(async () => {
      tries += 1;
      if (tries < 2) throw new Error("not yet");
      return tries;
    });
    expect(outcome).toBe(2);
  });

  it("keeps trying while time is stopped, and moves no timer", async () => {
    vi.useFakeTimers();
    const fired = vi.fn();
    setTimeout(fired, 5);
    let tries = 0;
    await waitFor(() => {
      tries += 1;
      if (tries < 4) throw new Error("not yet");
    });
    expect(fired).not.toHaveBeenCalled();
  });

  // These tests read what a test before them reported, so they run in the
  // order written.
  describe("when the test fails after the outcome came", {
    shuffle: false,
  }, () => {
    const reported: string[] = [];

    it.fails("fails with the test's own failure", async () => {
      onTestFailed(({ task }) => {
        for (const { message } of task.result?.errors ?? []) {
          reported.push(message);
        }
      });
      let tries = 0;
      await waitFor(() => {
        tries += 1;
        if (tries < 2) throw new Error("not yet");
      });
      throw new Error("the test's own failure");
    });

    it("reports nothing of the tries that came before", () => {
      expect(reported).toEqual(["the test's own failure"]);
    });
  });

  describe("when the outcome never comes", { shuffle: false }, () => {
    const reported: string[] = [];
    let tries = 0;

    it.fails("fails at the test's own time limit", {
      timeout: 80,
    }, async () => {
      onTestFailed(({ task }) => {
        for (const { message } of task.result?.errors ?? []) {
          reported.push(message);
        }
      });
      await waitFor(() => {
        tries += 1;
        throw new Error("the outcome never came");
      });
    });

    it("reports the last try's failure beside the time limit's", () => {
      expect(reported.some((message) => /timed out/i.test(message))).toBe(true);
      expect(reported).toContain("the outcome never came");
    });

    it("stops trying when the test has ended", async () => {
      const before = tries;
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(tries).toBe(before);
    });

    it.fails("fails the same way when what is thrown is not an error", {
      timeout: 60,
    }, async () => {
      onTestFailed(({ task }) => {
        for (const { message } of task.result?.errors ?? []) {
          reported.push(message);
        }
      });
      await waitFor(() => {
        throw "a string, not an error";
      });
    });

    it("reports only the time limit then, having no error to put beside it", () => {
      expect(
        reported.filter((message) => /timed out/i.test(message)),
      ).toHaveLength(2);
      expect(reported).toHaveLength(3);
    });
  });
});
