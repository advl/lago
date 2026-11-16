import type { Mount } from "../src/lib/stream/index.js";

/** Clears the screen and writes `text` from its top-left corner. */
const drawFrame = (text: string) => `\x1b[2J\x1b[H${text}`;

/** Draws `first`, then `then` once `delay` milliseconds have passed. */
export const changeAfter =
  (first: string, then: string, delay: number): Mount =>
  ({ output }) => {
    output.write(drawFrame(first));
    const timer = setTimeout(() => output.write(drawFrame(then)), delay);
    return () => clearTimeout(timer);
  };

/** Counts to `last`, one step every 100 milliseconds, each step a timer set by the one before. */
export const countTo =
  (last: number): Mount =>
  ({ output }) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const draw = (count: number) => {
      output.write(drawFrame(`step ${count}`));
      if (count < last) timer = setTimeout(() => draw(count + 1), 100);
    };
    draw(0);
    return () => clearTimeout(timer);
  };

/** Draws a new frame every 80 milliseconds, for ever. */
export const spin: Mount = ({ output }) => {
  let turn = 0;
  output.write(drawFrame("|"));
  const timer = setInterval(() => {
    turn += 1;
    output.write(drawFrame("|/-\\".at(turn % 4) ?? "|"));
  }, 80);
  return () => clearInterval(timer);
};

/** Draws only once a promise has resolved and a real turn of the event loop has run. */
export const drawLater: Mount = ({ output }) => {
  void Promise.resolve().then(() =>
    setImmediate(() => output.write(drawFrame("later"))),
  );
  return () => {};
};

/** Shows, one per line, every chunk of bytes it reads, as JSON. */
export const echoInput: Mount = ({ input, output }) => {
  const seen: string[] = [];
  output.write(drawFrame("ready"));
  const show = (chunk: Buffer | string) => {
    seen.push(JSON.stringify(String(chunk)));
    output.write(drawFrame(seen.join("\n")));
  };
  input.on("data", show);
  return () => {
    input.off("data", show);
  };
};

/** Writes the colour environment the program sees when it is mounted. */
export const showEnvironment: Mount = ({ output }) => {
  output.write(
    drawFrame(`${process.env.FORCE_COLOR} ${process.env.COLORTERM}`),
  );
  return () => {};
};

/** Writes the clock's time when it is mounted, and the size and kind of terminal it was given. */
export const showClock: Mount = ({ input, output, viewport }) => {
  const terminal = output as typeof output & { columns: number; rows: number };
  const reading = input as typeof input & { isTTY: boolean };
  output.write(
    drawFrame(
      `${Date.now()}\n${terminal.columns}x${terminal.rows} ${viewport.cols}x${viewport.rows}\n${reading.isTTY}`,
    ),
  );
  return () => {};
};
