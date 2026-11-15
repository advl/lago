#!/bin/bash
set -euo pipefail

# Stages, commits, tags and pushes the version Lerna wrote.
# INPUTS:
# $1: tag (required) - The tag to create, such as v0.1.0.

if [ -z "${1:-}" ]; then
  echo "Error: tag argument is required."
  exit 1
fi

tag="$1"

git add .
git commit -m "chore(monorepo): bumps the version to $tag"
# The tag is annotated because Lerna reads only annotated tags when it works
# out which packages changed since the last release.
git tag "$tag" -m "$tag"
git push
git push origin "$tag"
