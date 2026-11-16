import type { GlobalTypes } from "./types.js";

const isText = (value: unknown) => typeof value === "string";

/**
 * Refuses a preview's `globalTypes` when a global has no values to take, or a
 * default that is not one of them. `where` names the preview in the error.
 */
export default function checkGlobalTypes(
  globalTypes: GlobalTypes | undefined,
  where: string,
): void {
  for (const [name, declared] of Object.entries(globalTypes ?? {})) {
    const values: unknown = declared?.values;
    if (
      !Array.isArray(values) ||
      values.length === 0 ||
      !values.every(isText)
    ) {
      throw new Error(
        `${where} declares the global ${name} with no values to take. Give it a list of text, as in ${name}: { values: ["light", "dark"], default: "light" }.`,
      );
    }
    if (!values.includes(declared.default)) {
      throw new Error(
        `${where} gives the global ${name} the default ${JSON.stringify(declared.default)}, which is not one of its values: ${values.join(", ")}.`,
      );
    }
  }
}
