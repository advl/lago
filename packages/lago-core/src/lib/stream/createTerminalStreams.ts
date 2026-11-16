import { PassThrough, Writable } from "node:stream";
import type { Viewport } from "../screen/index.js";

/**
 * A terminal's two streams, as a program asks of them: an input in raw mode
 * and an output of the given size, each marked as a terminal so the program
 * draws as it would in one. What the program writes is handed to `onWrite`.
 *
 * @note Impure: creates streams that call `onWrite` as they are written to.
 */
export default function createTerminalStreams(
  { cols, rows }: Viewport,
  onWrite: (bytes: string) => void,
): { readonly input: PassThrough; readonly output: Writable } {
  const input = new PassThrough();
  // Raw mode, and holding the process open, are a real terminal's to give;
  // here there is nothing to switch and nothing to hold.
  Object.assign(input, {
    isTTY: true,
    setRawMode: () => input,
    ref: () => input,
    unref: () => input,
  });
  const output = new Writable({
    decodeStrings: false,
    write(chunk, _encoding, done) {
      onWrite(String(chunk));
      done();
    },
  });
  Object.assign(output, { isTTY: true, columns: cols, rows });
  return { input, output };
}
