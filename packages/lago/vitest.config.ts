import { createConfig } from "@aztlan/lago-config";
import { mergeConfig } from "vitest/config";

// The gallery's own screens are tested as any project's would be: by Lago,
// configured by Lago's one function, at the size the gallery needs.
export default mergeConfig(
  createConfig({
    viewports: {
      terminal: { cols: 80, rows: 24 },
      wide: { cols: 120, rows: 30 },
    },
    coverage: true,
  }),
  // The binary's entry only hands the process to runLago and a real
  // terminal to openGallery, which are tested; it is the one file left out.
  { test: { coverage: { exclude: ["src/bin.ts"] } } },
);
