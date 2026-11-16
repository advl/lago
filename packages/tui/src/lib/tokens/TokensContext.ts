import { createContext } from "react";
import { tokens } from "./constants.js";
import type { Tokens } from "./types.js";

/**
 * The tokens a component draws with. Outside any `TokensProvider` it holds
 * `tokens`, the terminal's own colours, so a component drawn without one
 * looks as it always has.
 */
const TokensContext = createContext<Tokens>(tokens);

export default TokensContext;
