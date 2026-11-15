#!/bin/bash
set -euo pipefail

# Publishes the public packages of the checked-out release tag to npm.
# INPUTS:
# $1: version (required) - The released version, without the tag prefix.
#
# `from-package` publishes exactly the public packages whose manifest version
# the registry does not have yet. A publish that stopped partway is finished
# by running this step again, and a run after a full publish does nothing.
# tag.yml offers that run as its `publish_version` input.
#
# A pre-release goes to a dist-tag named by its identifier, so
# 0.1.0-rc.1 goes to `rc` and never takes `latest`; a stable release goes to
# `latest`.
#
# Lerna is the workspace's own, run through bunx. The runner image carries no
# global copy to fall back on.

VERSION="${1:-}"

if [[ -z "$VERSION" ]]; then
  echo "Error: version argument is empty; refusing to publish."
  exit 1
fi

if [[ "${GITHUB_REF:-}" != "refs/heads/main" ]]; then
  echo "Error: publishing runs from main only (got '${GITHUB_REF:-unset}')."
  exit 1
fi

if [[ "$VERSION" == *-* ]]; then
  PRERELEASE="${VERSION#*-}"
  DIST_TAG="${PRERELEASE%%.*}"
else
  DIST_TAG="latest"
fi

echo "Publishing $VERSION to dist-tag '$DIST_TAG'"
bunx lerna publish --yes --no-private --dist-tag "$DIST_TAG" from-package
