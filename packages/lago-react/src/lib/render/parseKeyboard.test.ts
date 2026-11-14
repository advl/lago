import { describe, expect, it } from "vitest";
import parseKeyboard from "./parseKeyboard.js";

const press = (key: string, modifiers = {}) => ({ key, modifiers });

describe("parseKeyboard", () => {
  it("presses plain characters one by one, whole characters included", () => {
    expect(parseKeyboard("a é👍")).toEqual(
      ["a", " ", "é", "👍"].map((key) => press(key)),
    );
  });

  it("presses a named key as the renderer names it, or as a terminal sends it", () => {
    expect(parseKeyboard("{Enter}{ArrowDown}{F5}{PageUp}{a}")).toEqual([
      press("RETURN"),
      press("ARROW_DOWN"),
      press("F5"),
      press("\x1b[5~"),
      press("a"),
    ]);
  });

  it("holds a modifier from where it is pressed to where it is released", () => {
    expect(
      parseKeyboard(
        "{Control>}c{/Control}{Shift>}{Alt>}{Tab}{/Alt}{/Shift}{Meta>}k{/Meta}x",
      ),
    ).toEqual([
      press("c", { ctrl: true }),
      press("TAB", { shift: true, meta: true }),
      press("k", { super: true }),
      press("x"),
    ]);
  });

  it("takes a doubled bracket as the bracket itself, and a closing one as it is", () => {
    expect(parseKeyboard("{{a}[[b]").map(({ key }) => key)).toEqual([
      "{",
      "a",
      "}",
      "[",
      "b",
      "]",
    ]);
  });

  it.each([
    [
      "a key it does not know",
      "{Enterr}",
      "{Enterr} is not a key; the named keys are Enter, Escape",
    ],
    ["an empty descriptor", "{}", "{} is not a key"],
    [
      "a key code in square brackets",
      "[KeyA]",
      "A key code in square brackets is not supported",
    ],
    ["a bracket never closed", "a{Enter", "A { is never closed"],
    [
      "holding a key that is not a modifier",
      "{Enter>}",
      "{Enter>} holds a key that cannot be held; those that can are Control, Shift, Alt, Meta",
    ],
    [
      "releasing a key that is not held",
      "{/Shift}",
      "{/Shift} releases a key that is not held",
    ],
    ["a modifier left held", "{Shift>}a", "{Shift>} is never released"],
  ])("refuses %s, quoting what was typed", (_, text, message) => {
    expect(() => parseKeyboard(text)).toThrow(message);
    expect(() => parseKeyboard(text)).toThrow(`in ${JSON.stringify(text)}.`);
  });
});
