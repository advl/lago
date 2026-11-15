/**
 * How well `name` answers `query`, ignoring case: 3 when it starts with it,
 * 2 when it holds it, 1 when it holds its letters in order, and 0 when not.
 */
export default function rankName(name: string, query: string): number {
  const said = name.toLowerCase();
  const asked = query.toLowerCase();
  if (said.startsWith(asked)) return 3;
  if (said.includes(asked)) return 2;
  let from = 0;
  for (const letter of asked) {
    from = said.indexOf(letter, from);
    if (from < 0) return 0;
    from += 1;
  }
  return 1;
}
