#!/usr/bin/env bash
# Stop hook: warn if sensitive files are staged for commit.
set -e

if ! git rev-parse --git-dir > /dev/null; then
  exit 0
fi

staged=$(git diff --cached --name-only)
for f in $staged; do
  case "$f" in
    *.env|*.env.*|*id_rsa*|*id_ed25519*|*secrets*|*.pem|*.key|*credentials.json|*gcp-*.json)
      echo "WARNING: sensitive file staged: $f" >&2
      ;;
  esac
done

exit 0
