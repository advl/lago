#!/bin/bash
set -euo pipefail

# Puts the changelogs Lerna wrote in the repository's markdown form, then
# holds them, and everything else the version commit carries, to the leakage
# gate before anything is committed.
#
# Lerna writes its header with the paragraph broken across two lines, and
# writes it again at every release, so it is joined here each time rather
# than once by hand. The gate runs here because the commit this step feeds
# is pushed to main without a pull request, so nothing else would check it.

find . -name CHANGELOG.md -not -path "*/node_modules/*" -print0 |
  while IFS= read -r -d '' changelog; do
    perl -0pi -e 's/documented in this file\.\nSee /documented in this file. See /' "$changelog"
  done

bun run check:leakage
