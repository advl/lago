/**
 * The first of `count` things shown `shown` at a time, moved from `first` as
 * little as keeps `selected` in view, and never past the last that fills
 * the view.
 */
export default function placeWindow(
  first: number,
  selected: number,
  shown: number,
  count: number,
): number {
  const kept = Math.min(Math.max(first, selected - shown + 1), selected);
  return Math.max(0, Math.min(kept, count - shown));
}
