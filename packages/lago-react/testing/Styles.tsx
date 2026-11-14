import { RGBA, TextAttributes } from "@opentui/core";

/** One line per way of asking for a colour or an attribute, and one of wide characters. */
export default function Styles() {
  return (
    <box flexDirection="column">
      <text fg={RGBA.fromIndex(1)} bg={RGBA.fromIndex(8)}>
        palette
      </text>
      <text fg={RGBA.defaultForeground()} bg={RGBA.defaultBackground()}>
        terminal
      </text>
      <text fg="#ff8800">fixed</text>
      <text fg={RGBA.fromIndex(2)}>
        plain <b>bold</b> <u>under</u>
      </text>
      <text
        fg={RGBA.fromIndex(3)}
        attributes={
          TextAttributes.BLINK |
          TextAttributes.DIM |
          TextAttributes.HIDDEN |
          TextAttributes.ITALIC |
          TextAttributes.STRIKETHROUGH
        }
      >
        every
      </text>
      <text
        fg={RGBA.fromIndex(6)}
        bg={RGBA.fromIndex(7)}
        attributes={TextAttributes.INVERSE}
      >
        turned
      </text>
      <text fg={RGBA.fromIndex(4)}>日本 wide</text>
      <box backgroundColor={RGBA.fromIndex(5)} width={4} height={1} />
    </box>
  );
}
