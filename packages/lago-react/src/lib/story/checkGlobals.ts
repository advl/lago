import type { Globals, GlobalTypes } from "./types.js";

/** The names a refusal offers, or what to do when there are none. */
const listDeclared = (globalTypes: GlobalTypes) => {
  const names = Object.keys(globalTypes);
  return names.length === 0
    ? "it declares none: declare each in the preview's globalTypes"
    : `it declares ${names.join(", ")}`;
};

/**
 * Refuses globals the project's preview does not declare, or a value a
 * global does not take, naming the choices. `where` says who set them, as in
 * `src/Row.stories.tsx: the story "rows/Row Default"`, and opens the error.
 */
export default function checkGlobals(
  globalTypes: GlobalTypes,
  globals: Globals,
  where: string,
): void {
  for (const [name, value] of Object.entries(globals)) {
    const declared = Object.hasOwn(globalTypes, name)
      ? globalTypes[name]
      : undefined;
    if (declared === undefined) {
      throw new Error(
        `${where} sets the global ${JSON.stringify(name)}, which the preview does not declare: ${listDeclared(globalTypes)}.`,
      );
    }
    if (!declared.values.includes(value)) {
      throw new Error(
        `${where} sets the global ${name} to ${JSON.stringify(value)}, which is not one of its values: ${declared.values.join(", ")}.`,
      );
    }
  }
}
