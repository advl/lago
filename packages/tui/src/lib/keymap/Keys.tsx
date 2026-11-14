import { KeymapProvider } from "@opentui/keymap/react";
import { useRenderer } from "@opentui/react";
import { type ReactNode, useMemo } from "react";
import createKeymap from "./createKeymap.js";

interface Props {
  readonly children: ReactNode;
}

/**
 * Gives `children` a keymap made by `createKeymap` on the renderer they are
 * drawn with, so a component binds its keys and reads its commands the same
 * way in an application, in a test and in a story.
 */
export default function Keys({ children }: Props) {
  const renderer = useRenderer();
  const keymap = useMemo(() => createKeymap(renderer), [renderer]);
  return <KeymapProvider keymap={keymap}>{children}</KeymapProvider>;
}
