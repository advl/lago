import { useContext } from "react";
import type { Palette } from "../../plugins/index.js";
import PaletteContext from "./PaletteContext.js";

/**
 * The palette chosen: its name, and the table a picture's palette entries
 * would be shown in, or none for `terminal`, where an entry is the
 * terminal's own.
 */
export default function usePalette(): Palette {
  return useContext(PaletteContext);
}
