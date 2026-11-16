import type { ReactNode } from "react";
import TokensContext from "./TokensContext.js";
import type { TokensProviderProps } from "./types.js";

/**
 * Gives `children` a set of tokens to draw with in place of `tokens`, so an
 * application, or the gallery, draws every component in colours of its own.
 * The innermost provider is the one a component reads.
 */
export default function TokensProvider({
  tokens,
  children,
}: TokensProviderProps): ReactNode {
  return <TokensContext value={tokens}>{children}</TokensContext>;
}
