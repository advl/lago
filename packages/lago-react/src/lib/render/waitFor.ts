import { waitFor } from "@aztlan/lago-core";

/**
 * Runs a check until it stops throwing, and gives what it returned. It names
 * no renderer, so it is @aztlan/lago-core's, given here to the tests that
 * import their screen from this package.
 */
export default waitFor;
