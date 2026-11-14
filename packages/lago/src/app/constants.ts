/** What `lago --help` prints. */
export const usage = `Usage: lago [project]

Opens the gallery of a project's stories: the project's own vitest draws
each story at each viewport its configuration names, and draws a stories
file again when it is saved. The project is configured by createConfig
from @aztlan/lago-config; it is the current folder when none is named.

Options:
  -h, --help     print this and exit
  -v, --version  print the version and exit
`;
