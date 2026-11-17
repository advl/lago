import { createContext } from "react";
import { noContributions, type Palette } from "../../plugins/index.js";

/**
 * The palette chosen, which the gallery sets for whatever it draws to read:
 * `terminal`, which has no colours of its own, outside any provider.
 */
const PaletteContext = createContext<Palette>(
  noContributions.palettes.at(0) as Palette,
);

export default PaletteContext;
