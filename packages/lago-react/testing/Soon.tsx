import { useEffect, useState } from "react";

/** Says "now" once a timer of no delay fires. */
export default function Soon() {
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFired(true), 0);
    return () => clearTimeout(timer);
  }, []);
  return <text>{fired ? "now" : "soon"}</text>;
}
