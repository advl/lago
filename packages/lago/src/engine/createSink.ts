import { Writable } from "node:stream";

/** A stream that swallows what vitest would print over the gallery's screen. */
export default function createSink(): Writable {
  return new Writable({ write: (_chunk, _encoding, done) => done() });
}
