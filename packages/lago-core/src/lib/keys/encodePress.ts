import type { Modifiers, Press } from "../screen/index.js";
import { keySequences } from "./constants.js";

/** The number a sequence carries for the modifiers held: 1, plus each one's own. */
const readModifierNumber = ({ shift, meta, ctrl, super: held }: Modifiers) =>
  1 + (shift ? 1 : 0) + (meta ? 2 : 0) + (ctrl ? 4 : 0) + (held ? 8 : 0);

const namePress = ({ key, modifiers }: Press) =>
  [
    ...Object.entries(modifiers)
      .filter(([, held]) => held)
      .map(([name]) => name),
    key,
  ].join("+");

/** A sequence written again with the held modifiers as its parameter. */
function addModifiers(sequence: string, modifiers: Modifiers): string {
  const number = readModifierNumber(modifiers);
  // The function keys F1 to F4 are sent as SS3 sequences, which take no
  // parameter; held, they are sent in the CSI form that does.
  if (sequence.startsWith("\x1bO")) return `\x1b[1;${number}${sequence.at(2)}`;
  // A CSI sequence is the introducer, its parameter, and one closing
  // character; a key with none takes 1 before the modifiers.
  const parameter = sequence.slice(2, -1) || "1";
  return `\x1b[${parameter};${number}${sequence.slice(-1)}`;
}

/** A key that is a single control character, sent with what of its modifiers it can carry. */
function encodeControlKey(press: Press, sequence: string): string {
  const { shift, meta, ctrl, super: held } = press.modifiers;
  if (press.key === "Tab" && shift && !meta && !ctrl && !held) return "\x1b[Z";
  if (shift || ctrl || held) {
    throw new Error(
      `${namePress(press)} has no bytes a terminal sends without the kitty keyboard protocol; only Alt can be held with it, as an escape before the key`,
    );
  }
  return meta ? `\x1b${sequence}` : sequence;
}

/** A typed character, sent with what of its modifiers it can carry. */
function encodeCharacter(press: Press): string {
  const { shift, meta, ctrl, super: held } = press.modifiers;
  if (held) {
    throw new Error(
      `${namePress(press)} has no bytes a terminal sends without the kitty keyboard protocol`,
    );
  }
  let text = shift ? press.key.toUpperCase() : press.key;
  if (ctrl) {
    const code = text.toUpperCase().charCodeAt(0);
    // Control with a letter or one of @[\]^_ sends that character less 64;
    // with a space, the null character.
    if (text === " ") text = "\x00";
    else if (text.length === 1 && code >= 0x40 && code <= 0x5f)
      text = String.fromCodePoint(code - 0x40);
    else {
      throw new Error(
        `${namePress(press)} has no control character; Control is sent with a letter, a space or one of @[\\]^_`,
      );
    }
  }
  return meta ? `\x1b${text}` : text;
}

/**
 * The bytes a terminal sends a program for one key press, in the encoding
 * most terminals use without being asked for another: a character as itself,
 * Control with a letter as a control character, Alt as an escape before the
 * key, and a held modifier on a named key's sequence as its parameter. A
 * press that encoding cannot express, such as Control with Enter, is refused
 * by name rather than sent as something else.
 */
export default function encodePress(press: Press): string {
  if (!press.named) return encodeCharacter(press);
  const sequence = keySequences[press.key];
  if (!sequence.startsWith("\x1b") || sequence === "\x1b")
    return encodeControlKey(press, sequence);
  const { shift, meta, ctrl, super: held } = press.modifiers;
  return shift || meta || ctrl || held
    ? addModifiers(sequence, press.modifiers)
    : sequence;
}
