import type { Viewport } from "@aztlan/lago-core";
import { createContext } from "react";

/**
 * The size of the screen a component is mounted on, given by whatever mounts
 * it, so that a story is drawn at its screen's size without asking a
 * renderer for it.
 */
const ViewportContext = createContext<Viewport | undefined>(undefined);

export default ViewportContext;
