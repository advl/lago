import type { Parameters } from "./types.js";

/** What a story says of itself in `parameters.docs.description.story`, if anything. */
export default function readDescription(
  parameters: Parameters,
): string | undefined {
  let value: unknown = parameters;
  for (const key of ["docs", "description", "story"]) {
    if (typeof value !== "object" || value === null) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return typeof value === "string" ? value : undefined;
}
