import { useRenderer } from "@opentui/react";
import { useEffect } from "react";

/** Asks for a new frame on every frame, so its screen never settles. */
export default function Restless() {
  const renderer = useRenderer();
  useEffect(() => {
    const ask = async () => renderer.requestRender();
    renderer.setFrameCallback(ask);
    return () => renderer.removeFrameCallback(ask);
  }, [renderer]);
  return <text>restless</text>;
}
