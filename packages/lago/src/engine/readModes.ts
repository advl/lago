import type { Mode } from "@aztlan/lago-react/vitest";
import type { CatalogMode } from "../catalog/index.js";

/**
 * The modes the stories plugin names under its `api`, in the order the
 * project gave them; none when the plugin names none.
 */
export default function readModes(
  api: { readonly modes?: Readonly<Record<string, Mode>> } | undefined,
): CatalogMode[] {
  return Object.entries(api?.modes ?? {}).map(([name, { globals }]) => ({
    name,
    globals,
  }));
}
