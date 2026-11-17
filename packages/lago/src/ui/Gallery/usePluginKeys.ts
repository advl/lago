import { useBindings } from "@opentui/keymap/react";
import type { Palette } from "../../plugins/index.js";
import type { UsePluginKeysProps } from "./types.js";

/**
 * Binds `t`, which steps to the next palette, round, when a plugin gives
 * one, and every key the plugins give, each run with what it
 * may read of the gallery and do to it, after `onKey`, as every key of the
 * gallery's own clears its last message; one that throws says so in the
 * status line. Each acts only while nothing is
 * typed or asked and the help is closed. A plugin's keys are listed in the
 * help under the plugin's name.
 */
export default function usePluginKeys({
  plugins,
  free,
  control,
  onKey,
}: UsePluginKeysProps) {
  const { palettes, keys } = plugins;
  useBindings(
    () => ({
      commands: [
        ...(palettes.length > 1
          ? [
              {
                name: "palette",
                desc: "step to the next palette",
                hint: "palette",
                group: "Picture",
                enabled: free,
                run: () => {
                  onKey();
                  const at = palettes.findIndex(
                    ({ name }) => name === control.selection.palette,
                  );
                  // Bound only while there are palettes to step through.
                  const next = palettes.at(
                    (at + 1) % palettes.length,
                  ) as Palette;
                  control.setPalette(next.name);
                },
              },
            ]
          : []),
        ...keys.map((key, place) => ({
          name: `plugin.${key.plugin}.${place}`,
          desc: key.description,
          group: key.plugin,
          enabled: free,
          run: () => {
            onKey();
            // A plugin's failure is told in the status line, and the
            // gallery goes on.
            try {
              key.run(control);
            } catch (error) {
              control.say(
                `the plugin ${key.plugin}'s ${key.key} failed: ${String(error).replace(/^Error: /, "")}`,
              );
            }
          },
        })),
      ],
      bindings: [
        ...(palettes.length > 1 ? [{ key: "t", cmd: "palette" }] : []),
        ...keys.map((key, place) => ({
          key: key.key,
          cmd: `plugin.${key.plugin}.${place}`,
        })),
      ],
    }),
    [palettes, keys, free, control, onKey],
  );
}
