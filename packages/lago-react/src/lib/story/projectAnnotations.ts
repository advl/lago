import type { Preview } from "./types.js";

/**
 * The preview `composeStories` sets each story inside: the one
 * `setProjectAnnotations` last gave, or none.
 */
const projectAnnotations: { current: Preview } = { current: {} };

export default projectAnnotations;
