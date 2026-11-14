import { useKeyboard } from "@opentui/react";
import { useState } from "react";

/**
 * Counts `+` from the count it last drew, as a component that does not use
 * an updater does: two keys sent in one frame would count once.
 */
export default function Tally() {
  const [count, setCount] = useState(0);
  useKeyboard((key) => {
    if (key.name === "+") setCount(count + 1);
  });
  return <text>{`count ${count}`}</text>;
}
