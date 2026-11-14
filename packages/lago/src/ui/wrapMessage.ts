import { fitField } from "@aztlan/tui";

/** A message's lines wrapped to `cols` columns, each of its own lines kept as one. */
export default function wrapMessage(text: string, cols: number): string[] {
  return text
    .split("\n")
    .flatMap((line) => fitField({ text: line, kind: "quote" }, "block", cols));
}
