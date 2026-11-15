import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, onTestFinished, vi } from "vitest";
import { usage } from "./constants.js";
import runLago from "./runLago.js";

/** A call's terminal in a scratch folder, and what was written to each stream. */
function makeTerminal() {
  const cwd = mkdtempSync(join(tmpdir(), "lago-call-"));
  onTestFinished(() => rmSync(cwd, { recursive: true, force: true }));
  const out: string[] = [];
  const err: string[] = [];
  return {
    terminal: {
      cwd,
      version: "1.2.3",
      interactive: true,
      write: (text: string) => out.push(text),
      warn: (text: string) => err.push(text),
    },
    out,
    err,
  };
}

describe("runLago", () => {
  it("prints the help and the version, and opens nothing", async () => {
    const { terminal, out, err } = makeTerminal();
    const open = vi.fn(() => Promise.resolve(0));
    expect(await runLago(["--help"], terminal, open)).toBe(0);
    expect(await runLago(["-v"], terminal, open)).toBe(0);
    expect([out, err]).toEqual([[usage, "1.2.3\n"], []]);
    expect(open).not.toHaveBeenCalled();
  });

  it("refuses a call it cannot read with the reason and the usage, exiting 2", async () => {
    const { terminal, err } = makeTerminal();
    expect(await runLago(["--watch"], terminal, () => Promise.resolve(0))).toBe(
      2,
    );
    expect(err).toEqual([`lago: unknown option --watch\n\n${usage}`]);
  });

  it("refuses a project that is not a folder", async () => {
    const { terminal, err } = makeTerminal();
    writeFileSync(join(terminal.cwd, "file"), "");
    expect(await runLago(["missing"], terminal, () => Promise.resolve(0))).toBe(
      2,
    );
    expect(await runLago(["file"], terminal, () => Promise.resolve(0))).toBe(2);
    expect(err).toEqual([
      `lago: no folder at ${join(terminal.cwd, "missing")}\n`,
      `lago: no folder at ${join(terminal.cwd, "file")}\n`,
    ]);
  });

  it("opens the gallery on the project folder and gives its exit code, or why it could not open", async () => {
    const { terminal, err } = makeTerminal();
    const open = vi.fn(() => Promise.resolve(0));
    expect(await runLago([], terminal, open)).toBe(0);
    expect(open).toHaveBeenCalledWith(terminal.cwd);
    const failing = () => Promise.reject(new Error("vitest could not start"));
    expect(await runLago([], terminal, failing)).toBe(1);
    expect(err).toEqual(["lago: vitest could not start\n"]);
  });
  it("refuses to open the gallery where there is no terminal to draw on", async () => {
    const { terminal, err } = makeTerminal();
    const open = vi.fn(() => Promise.resolve(0));
    expect(await runLago([], { ...terminal, interactive: false }, open)).toBe(
      2,
    );
    expect(err).toEqual(["lago: the gallery needs a terminal to draw on\n"]);
    expect(open).not.toHaveBeenCalled();
  });
});
