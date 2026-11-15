import { RGBA } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

interface Props {
  readonly label: string;
  readonly start?: number;
  /** The columns the counter may use; its label is cut to fit. */
  readonly width?: number;
}

/** Counts what it is labelled with: `+` adds one and `-` takes one away. */
export default function Counter({ label, start = 0, width = 24 }: Props) {
  const [count, setCount] = useState(start);
  useKeyboard((key) => {
    if (key.name === "+") setCount((before) => before + 1);
    if (key.name === "-") setCount((before) => before - 1);
  });
  return (
    <box flexDirection="column" width={width}>
      <text fg={RGBA.fromIndex(4)}>
        <b>{label.slice(0, width - 4)}</b> {count}
      </text>
    </box>
  );
}
