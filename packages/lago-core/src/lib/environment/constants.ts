/**
 * The environment a terminal program is given, as an interactive terminal of
 * full colour would give it, so a picture is the same on every machine and
 * in a pipeline. A name given no value is removed for the test.
 *
 * A program colours through a library that reads the environment once, when
 * it is loaded, and lowers a fixed colour to the nearest palette entry
 * wherever the terminal claims fewer colours: with `TERM` naming a basic
 * console, even `FORCE_COLOR=3` gives sixteen unless `COLORTERM` says
 * otherwise. The same library lowers it again when it finds the variables a
 * pipeline sets, and a program that finds them may draw nothing until it
 * exits, as a pipeline's log has no screen to redraw. A pipeline's marks are
 * therefore removed: `CI` and `CONTINUOUS_INTEGRATION`, which every check
 * reads first, and the two the colour library reads on their own.
 */
export const terminalEnvironment: Readonly<Record<string, string | undefined>> =
  {
    FORCE_COLOR: "3",
    COLORTERM: "truecolor",
    CI: undefined,
    CONTINUOUS_INTEGRATION: undefined,
    TEAMCITY_VERSION: undefined,
    TF_BUILD: undefined,
  };
