// A screen and its keyboard are the same whatever draws them, so they are
// defined by @aztlan/lago-core; a test imports their types from this package,
// which mounts on one.
export type { Screen, UserEvent, Viewport } from "@aztlan/lago-core";
