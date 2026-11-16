import { useContext } from "react";
import TokensContext from "./TokensContext.js";
import type { Tokens } from "./types.js";

/**
 * The tokens the nearest `TokensProvider` gives, or `tokens` where there is
 * none. A component reads them as it draws, so a colour follows the set it
 * is drawn under.
 */
export default function useTokens(): Tokens {
  return useContext(TokensContext);
}
