import { useEffect, useState } from "react";

/** Says "waiting" until a second has passed, then "done". */
export default function Countdown() {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 1_000);
    return () => clearTimeout(timer);
  }, []);
  return <text>{done ? "done" : "waiting"}</text>;
}
