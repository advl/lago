import { parseSync } from "oxc-parser";

/** A documentation comment's text: its lines joined, without the stars that frame them. */
const cleanComment = (value: string) =>
  value
    .split("\n")
    .map((line) => line.replace(/^\s*\*+\s?/, "").trim())
    .filter(Boolean)
    .join(" ");

/**
 * The documentation comment directly above each named export of a stories
 * file, by the export's name and in the file's order. An export without one
 * has an empty entry, so the order is complete.
 *
 * The source is parsed, not searched: a comment is a story's only when
 * nothing but space stands between it and the export.
 */
export default function readComments(
  file: string,
  source: string,
): Record<string, string> {
  const { program, comments } = parseSync(file, source);
  const found: Record<string, string> = {};
  for (const node of program.body) {
    if (node.type !== "ExportNamedDeclaration" || !node.declaration) continue;
    const { declaration } = node;
    // A value alone can be a story: a type exported beside them is not one.
    const names =
      declaration.type === "VariableDeclaration"
        ? declaration.declarations.flatMap(({ id }) =>
            id.type === "Identifier" ? [id.name] : [],
          )
        : declaration.type === "FunctionDeclaration" && declaration.id
          ? [declaration.id.name]
          : [];
    const above = comments.find(
      (comment) =>
        comment.type === "Block" &&
        comment.value.startsWith("*") &&
        comment.end <= node.start &&
        source.slice(comment.end, node.start).trim() === "",
    );
    for (const name of names)
      found[name] = above ? cleanComment(above.value) : "";
  }
  return found;
}
