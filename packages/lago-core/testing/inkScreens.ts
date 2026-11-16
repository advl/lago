import { Box, Text, useInput } from "ink";
import { createElement, useEffect, useState } from "react";

/** Three runs: a palette entry, a fixed colour, and text inverted. */
export function Colours() {
  return createElement(
    Box,
    { gap: 1 },
    createElement(Text, { color: "red" }, "red"),
    createElement(Text, { color: "#ff8800" }, "hex"),
    createElement(Text, { inverse: true }, "inv"),
  );
}

/** Shows "first", then "second" once 500 milliseconds have passed. */
export function Later() {
  const [text, setText] = useState("first");
  useEffect(() => {
    const timer = setTimeout(() => setText("second"), 500);
    return () => clearTimeout(timer);
  }, []);
  return createElement(Text, null, text);
}

/** Shows the last key it read: its input, then the names Ink gives it. */
export function LastKey() {
  const [last, setLast] = useState("none");
  useInput((input, key) => {
    const names = Object.entries(key)
      .filter(([, held]) => held === true)
      .map(([name]) => name)
      .sort();
    setLast([JSON.stringify(input), ...names].join(" "));
  });
  return createElement(Text, null, last);
}
