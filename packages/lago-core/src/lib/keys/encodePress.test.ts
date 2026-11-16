import { describe, expect, it } from "vitest";
import { type KeyName, keyNames, type Modifiers } from "../screen/index.js";
import encodePress from "./encodePress.js";

const typed = (key: string, modifiers: Modifiers = {}) =>
  encodePress({ named: false, key, modifiers });
const named = (key: KeyName, modifiers: Modifiers = {}) =>
  encodePress({ named: true, key, modifiers });

describe("encodePress", () => {
  it("sends a character as itself, a whole cluster included", () => {
    expect(["a", "é", "👍🏽", " "].map((key) => typed(key))).toEqual([
      "a",
      "é",
      "👍🏽",
      " ",
    ]);
  });

  it("sends every named key as a terminal sends it, each differently", () => {
    const sent = keyNames.map((name) => named(name));
    expect(new Set(sent).size).toBe(keyNames.length);
    expect(
      Object.fromEntries(keyNames.map((name, index) => [name, sent[index]])),
    ).toMatchObject({
      Enter: "\r",
      Escape: "\x1b",
      Tab: "\t",
      Backspace: "\x7f",
      ArrowUp: "\x1b[A",
      Home: "\x1b[H",
      PageDown: "\x1b[6~",
      F1: "\x1bOP",
      F12: "\x1b[24~",
    });
  });

  it("writes held modifiers into a named key's sequence as its parameter", () => {
    expect(named("ArrowUp", { shift: true })).toBe("\x1b[1;2A");
    expect(named("ArrowRight", { ctrl: true })).toBe("\x1b[1;5C");
    expect(named("ArrowUp", { meta: true })).toBe("\x1b[1;3A");
    expect(named("Delete", { ctrl: true, shift: true })).toBe("\x1b[3;6~");
    expect(named("F1", { super: true })).toBe("\x1b[1;9P");
  });

  it("sends Control with a letter as its control character, and with a space as the null character", () => {
    expect(typed("a", { ctrl: true })).toBe("\x01");
    expect(typed("C", { ctrl: true })).toBe("\x03");
    expect(typed("[", { ctrl: true })).toBe("\x1b");
    expect(typed(" ", { ctrl: true })).toBe("\x00");
  });

  it("sends Alt as an escape before the key, and Shift with a letter as the capital", () => {
    expect(typed("a", { meta: true })).toBe("\x1ba");
    expect(typed("a", { shift: true })).toBe("A");
    expect(typed("x", { meta: true, ctrl: true })).toBe("\x1b\x18");
    expect(named("Enter", { meta: true })).toBe("\x1b\r");
    expect(named("Escape", { meta: true })).toBe("\x1b\x1b");
  });

  it("sends Shift with Tab as a terminal's back tab", () => {
    expect(named("Tab", { shift: true })).toBe("\x1b[Z");
  });

  it.each([
    ["Control with Enter", () => named("Enter", { ctrl: true }), "ctrl+Enter"],
    [
      "Shift with Backspace",
      () => named("Backspace", { shift: true }),
      "shift+Backspace",
    ],
    ["Super with a character", () => typed("k", { super: true }), "super+k"],
    ["Control with a digit", () => typed("1", { ctrl: true }), "ctrl+1"],
  ])("refuses %s, which a terminal cannot send, by name", (_, press, name) => {
    expect(press).toThrow(`${name} has no`);
  });
});
