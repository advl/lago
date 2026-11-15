import { useEffect } from "react";

interface Props {
  /** When it throws: as it draws, or in its first effect. */
  readonly when: "drawing" | "effect";
}

/** Throws on purpose, so a test can see the failure reach it. */
export default function Broken({ when }: Props) {
  if (when === "drawing") throw new Error("cannot draw this");
  useEffect(() => {
    throw new Error("cannot finish this");
  }, []);
  return <text>drawn</text>;
}
