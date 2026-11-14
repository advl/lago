import { useKeyboard, usePaste } from "@opentui/react";
import { useState } from "react";

/** Shows every key it is sent, one line each, and what is pasted into it. */
export default function Keys() {
  const [seen, setSeen] = useState<readonly string[]>([]);
  useKeyboard((key) => {
    const held = [
      key.ctrl ? "ctrl" : "",
      key.meta ? "meta" : "",
      key.shift ? "shift" : "",
      key.super ? "super" : "",
    ].filter(Boolean);
    setSeen((before) => [...before, [...held, key.name].join("+")]);
  });
  usePaste((paste) => {
    const text = new TextDecoder().decode(paste.bytes);
    setSeen((before) => [...before, `pasted ${text}`]);
  });
  return (
    <box flexDirection="column">
      <text>keys</text>
      {seen.map((each, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the list only grows.
        <text key={index}>{each}</text>
      ))}
    </box>
  );
}
