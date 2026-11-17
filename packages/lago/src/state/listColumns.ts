import type { Catalog } from "../catalog/index.js";
import type { MatrixColumn } from "./types.js";

/** The matrix's columns: each viewport in the catalog's order, in the base and then in each mode. */
export default function listColumns(catalog: Catalog): MatrixColumn[] {
  return catalog.viewports.flatMap((viewportName) => [
    { viewportName, mode: undefined },
    ...catalog.modes.map(({ name }) => ({ viewportName, mode: name })),
  ]);
}
