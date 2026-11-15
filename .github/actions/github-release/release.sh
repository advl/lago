#!/bin/bash
set -euo pipefail

# Creates the GitHub Release for a tag, marked a pre-release when the version
# is one.
#
# INPUTS:
# $1: version (required) - The released version, without the tag prefix.
# $2: tag_prefix (optional) - Prefix of the git tag. Default is "v".
#
# Requires: GH_TOKEN with contents:write, the gh CLI, and the tag.

if [ -z "${1:-}" ]; then
  echo "Error: version argument is required."
  exit 1
fi

version="$1"
tag_prefix="${2:-v}"
tag="${tag_prefix}${version}"

prerelease=()
if [[ "$version" == *-* ]]; then
  prerelease=(--prerelease)
fi

# A run of the publish job again finds the release made the first time.
if gh release view "$tag" > /dev/null 2>&1; then
  echo "Release $tag already exists."
else
  gh release create "$tag" --verify-tag --generate-notes "${prerelease[@]}"
fi
