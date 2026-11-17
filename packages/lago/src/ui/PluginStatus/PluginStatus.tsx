import { useTokens } from "@aztlan/tui";
import type { ReactNode } from "react";
import { itemSeparator } from "./constants.js";
import type { PluginStatusProps } from "./types.js";

/**
 * The end of the status line: each item `placeStatusItems` placed, after a
 * muted separator, a text in the text's colour or a component in the
 * columns it asked for, given the selection.
 */
const PluginStatus = ({ placed, selection }: PluginStatusProps): ReactNode => {
  const tokens = useTokens();
  return (
    <box flexDirection="row" width={placed.columns} height={1}>
      {placed.items.map((item, place) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the items are the plugins', in a fixed order.
        <box key={place} flexDirection="row">
          <text fg={tokens["color.text.muted"]}>{itemSeparator}</text>
          {"text" in item ? (
            <text fg={tokens["color.text"]}>{item.text}</text>
          ) : (
            <box width={item.columns} height={1}>
              <item.component selection={selection} />
            </box>
          )}
        </box>
      ))}
    </box>
  );
};

export default PluginStatus;
