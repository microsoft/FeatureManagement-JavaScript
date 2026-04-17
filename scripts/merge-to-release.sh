#!/bin/bash

# ============================================================================
# merge-to-release.sh
#
# Creates a PR to merge a development branch into its corresponding release
# branch. Used after a version bump PR has been merged.
#
# Usage:
#   ./scripts/merge-to-release.sh <version> [--preview]
#
# Examples:
#   ./scripts/merge-to-release.sh 2.5.0             # main → release/v2
#   ./scripts/merge-to-release.sh 2.5.0-preview.1 --preview  # preview → release/v2
#
# Prerequisites:
#   - git and gh (GitHub CLI) must be installed and authenticated
# ============================================================================

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: $(basename "$0") <version> [--preview]

Arguments:
  version       The version that was just bumped (used to determine major version)
  --preview     Merge preview → release/v{major} instead of main → release/v{major}

Examples:
  $(basename "$0") 2.5.0                       # main → release/v2
  $(basename "$0") 2.5.0-preview.1 --preview   # preview → release/v2
EOF
  exit 1
}

error() {
  echo "ERROR: $1" >&2
  exit 1
}

info() {
  echo "── $1"
}

# ── Parse arguments ──────────────────────────────────────────────────────────

VERSION=""
IS_PREVIEW=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --preview)
      IS_PREVIEW=true
      shift
      ;;
    -h|--help)
      usage
      ;;
    *)
      if [[ -z "$VERSION" ]]; then
        VERSION="$1"
      else
        error "Unexpected argument: $1"
      fi
      shift
      ;;
  esac
done

[[ -z "$VERSION" ]] && usage

# Validate version format
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-preview\.[0-9]+)?$'; then
  error "Invalid version format '$VERSION'. Expected: X.Y.Z or X.Y.Z-preview.N"
fi

# ── Determine branches ──────────────────────────────────────────────────────

# Extract major version (e.g. "2" from "2.5.0" or "2.5.0-preview.1")
MAJOR_VERSION=$(echo "$VERSION" | cut -d. -f1)

if [[ "$IS_PREVIEW" == true ]]; then
  SOURCE_BRANCH="preview"
  PR_TITLE="Merge preview to release/v${MAJOR_VERSION}"
else
  SOURCE_BRANCH="main"
  PR_TITLE="Merge main to release/v${MAJOR_VERSION}"
fi

TARGET_BRANCH="release/v${MAJOR_VERSION}"

info "Source branch : $SOURCE_BRANCH"
info "Target branch : $TARGET_BRANCH"
info "PR title      : $PR_TITLE"
echo ""

# ── Confirm with user ───────────────────────────────────────────────────────

read -rp "Proceed? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# ── Resolve project directory ───────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# ── Fetch latest branches ───────────────────────────────────────────────────

info "Fetching latest branches..."
git fetch origin "$SOURCE_BRANCH"
git fetch origin "$TARGET_BRANCH"

# ── Create PR ────────────────────────────────────────────────────────────────

info "Creating pull request..."
PR_URL=$(gh pr create \
  --base "$TARGET_BRANCH" \
  --head "$SOURCE_BRANCH" \
  --title "$PR_TITLE" \
  --body "Merge \`$SOURCE_BRANCH\` into \`$TARGET_BRANCH\` after version bump \`$VERSION\`.

> **Important**: Use **Merge commit** (not squash) when merging this PR to preserve commit history.

---
*This PR was created automatically by \`scripts/merge-to-release.sh\`.*")

echo ""
info "Done! PR created: $PR_URL"
echo ""
echo "⚠️  Remember: Use \"Merge commit\" (not squash) when merging this PR."
