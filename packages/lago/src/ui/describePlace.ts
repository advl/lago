/** Where a picture is drawn, in words: `narrow`, or `narrow in dark` in a mode. */
export default function describePlace(
  viewportName: string,
  mode: string | undefined,
): string {
  return mode === undefined ? viewportName : `${viewportName} in ${mode}`;
}
