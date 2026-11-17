import { useState } from "react";
import type { Contributions, PluginSelection } from "../src/plugins/index.js";

const dracula = [
  "#21222c",
  "#ff5555",
  ...Array.from({ length: 14 }, () => "#f8f8f2"),
];
const iceberg = Array.from({ length: 16 }, () => "#161821");

/** A status item that holds state: it counts how often it is drawn with another palette. */
function Changes({ selection }: { readonly selection: PluginSelection }) {
  const [seen, setSeen] = useState({ palette: selection.palette, changes: 0 });
  if (seen.palette !== selection.palette) {
    setSeen({ palette: selection.palette, changes: seen.changes + 1 });
  }
  return <text>{`${seen.changes} changes`}</text>;
}

/**
 * What a project's plugins would add to the gallery: three palettes, the
 * gallery opening on dracula, four keys of a plugin called probe, one of which throws, and two
 * status items, a text and a component.
 */
export const sampleContributions: Contributions = {
  palettes: [
    { name: "terminal", colours: undefined },
    { name: "dracula", colours: dracula },
    { name: "iceberg", colours: iceberg },
  ],
  palette: "dracula",
  chromes: {},
  keys: [
    {
      plugin: "probe",
      key: "g",
      description: "say what is selected",
      run: ({ selection, palettes, say }) =>
        say(
          `${selection.title} ${selection.story ?? "none"} ${selection.viewportName} ${selection.mode ?? "base"} ${selection.palette} of ${palettes.length}`,
        ),
    },
    {
      plugin: "probe",
      key: "shift+g",
      description: "show iceberg",
      run: ({ setPalette }) => setPalette("iceberg"),
    },
    {
      plugin: "probe",
      key: "ctrl+g",
      description: "show sepia",
      run: ({ setPalette }) => setPalette("sepia"),
    },
    {
      plugin: "probe",
      key: "ctrl+f",
      description: "fail",
      run: () => {
        throw new Error("the probe broke");
      },
    },
  ],
  status: [
    { text: ({ viewportName }) => `grid at ${viewportName}` },
    { columns: 9, component: Changes },
  ],
};
