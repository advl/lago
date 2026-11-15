import { useEffect, useState } from "react";

/** Shows the clock and the high-resolution clock, and draws again every second. */
export default function Clock() {
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((count) => count + 1), 1_000);
    return () => clearInterval(timer);
  }, []);
  return (
    <text>{`date ${Date.now()} perf ${Math.round(performance.now())}`}</text>
  );
}
