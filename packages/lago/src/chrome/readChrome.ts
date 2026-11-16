import { type Tokens, tokens } from "@aztlan/tui";
import { RGBA } from "@opentui/core";
import { chromes } from "./constants.js";
import type { ChromeName } from "./types.js";

const names = Object.keys(chromes).join(", ");

/**
 * Whether `value` is a colour. A configuration is loaded by vite, which may
 * load another build of the renderer than the gallery's, whose colours are
 * another class's instances; so a colour is known by the four numbers an
 * RGBA keeps everything it is in.
 */
const isColour = (value: unknown): value is RGBA =>
  value instanceof Object &&
  "buffer" in value &&
  value.buffer instanceof Uint16Array &&
  value.buffer.length === 4;

/** Whether `value` is a token of the same kind as `like`: a colour, an attribute or a glyph. */
const isLike = (value: unknown, like: unknown) =>
  isColour(like) ? isColour(value) : typeof value === typeof like;

/**
 * The tokens a project's `gallery.chrome` asks for: a built-in chrome by
 * its name, or a set of the project's own, which holds every token
 * `tokens` holds, each of the same kind, its colours made again by the
 * gallery's renderer. Nothing asked for is `terminal`.
 * Anything else is refused, naming the configuration's file and the
 * choices.
 */
export default function readChrome(chrome: unknown, file: string): Tokens {
  if (chrome === undefined) return chromes.terminal;
  if (typeof chrome === "string" && Object.hasOwn(chromes, chrome)) {
    return chromes[chrome as ChromeName];
  }
  if (typeof chrome !== "object" || chrome === null) {
    throw new Error(
      `${file} sets gallery.chrome to ${JSON.stringify(chrome)}, which is no chrome: name one of ${names}, or give a set of tokens.`,
    );
  }
  const given = chrome as Readonly<Record<string, unknown>>;
  const wrong = Object.entries(tokens)
    .filter(([name, like]) => !isLike(given[name], like))
    .map(([name]) => name);
  if (wrong.length > 0) {
    throw new Error(
      `${file} sets gallery.chrome to a set of tokens in which these are missing or of another kind than in @aztlan/tui's tokens: ${wrong.join(", ")}. Give every token, each of its kind, or name one of ${names}.`,
    );
  }
  // Each colour is made again by the gallery's own build of the renderer.
  return Object.fromEntries(
    Object.entries(given).map(([name, value]) => [
      name,
      isColour(value) ? RGBA.clone(value) : value,
    ]),
  ) as unknown as Tokens;
}
