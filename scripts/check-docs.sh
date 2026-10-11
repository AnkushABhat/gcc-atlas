#!/usr/bin/env sh
set -eu
base="${1:-origin/main}"
changed=$(git diff --name-only "$base"...HEAD)
for doc in $(git ls-files '*AGENTS.md' | grep -v '^AGENTS\.md$'); do
  dir=$(dirname "$doc")
  code=$(echo "$changed" | grep "^$dir/" | grep -v 'AGENTS\.md$' | grep -v '\.test\.' | grep -v '^data/seed/' | grep -v '^data/research/' || true)
  if [ -n "$code" ] && ! echo "$changed" | grep -qx "$doc"; then
    echo "::warning file=$doc::Files in $dir changed but $doc did not. Check that it is still accurate."
  fi
done
