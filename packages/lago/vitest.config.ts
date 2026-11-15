import { createConfig } from "@aztlan/lago-config";

// The gallery's own screens are tested as any project's would be: by Lago,
// configured by Lago's one function, at the size the gallery needs.
export default createConfig({
  viewports: {
    terminal: { cols: 80, rows: 24 },
    wide: { cols: 120, rows: 30 },
  },
  coverage: true,
});
