import { heldKeys, keyNames } from "./constants.js";
import type { KeyName, Press } from "./types.js";

/** A doubled bracket, a `{…}` descriptor, a lone opening bracket, or one character. */
const piece = /\{\{|\[\[|\{([^{}]*)\}|./gsu;

const isKeyName = (name: string): name is KeyName =>
  (keyNames as readonly string[]).includes(name);

/**
 * The key presses `text` describes in Testing Library's notation.
 *
 * Plain characters are pressed one by one. `{Enter}` presses a named key,
 * given by its name for the renderer to send, and `{a}` a character.
 * `{Shift>}` holds a modifier until `{/Shift}`. `{{` and `[[` are the two
 * brackets themselves. Whatever is accepted means what it means in Testing
 * Library; the rest of that notation is refused by name: a key code in
 * square brackets, a key that is not a modifier held or repeated, and a
 * modifier left held at the end.
 */
export default function parseKeyboard(text: string): Press[] {
  const presses: Press[] = [];
  const held = new Set<string>();
  const refuse = (reason: string): never => {
    throw new Error(`${reason}, in ${JSON.stringify(text)}.`);
  };
  const readModifiers = () =>
    Object.fromEntries([...held].map((name) => [heldKeys[name], true]));
  const press = (key: string) =>
    presses.push({ named: false, key, modifiers: readModifiers() });
  const pressNamed = (key: KeyName) =>
    presses.push({ named: true, key, modifiers: readModifiers() });
  for (const [whole, descriptor] of text.matchAll(piece)) {
    if (whole === "{{" || whole === "[[") press(whole.slice(1));
    else if (whole === "[") {
      refuse(
        "A key code in square brackets is not supported; write [[ for the bracket itself",
      );
    } else if (whole === "{") {
      refuse("A { is never closed; write {{ for the bracket itself");
    } else if (descriptor === undefined) press(whole);
    else if (descriptor.startsWith("/")) {
      if (!held.delete(descriptor.slice(1))) {
        refuse(`{${descriptor}} releases a key that is not held`);
      }
    } else if (descriptor.endsWith(">")) {
      const name = descriptor.slice(0, -1);
      if (!Object.hasOwn(heldKeys, name)) {
        refuse(
          `{${descriptor}} holds a key that cannot be held; those that can are ${Object.keys(heldKeys).join(", ")}`,
        );
      }
      held.add(name);
    } else if (isKeyName(descriptor)) {
      pressNamed(descriptor);
    } else if ([...descriptor].length === 1) press(descriptor);
    else {
      refuse(
        `{${descriptor}} is not a key; the named keys are ${keyNames.join(", ")}`,
      );
    }
  }
  const [left] = held;
  if (left !== undefined) refuse(`{${left}>} is never released`);
  return presses;
}
