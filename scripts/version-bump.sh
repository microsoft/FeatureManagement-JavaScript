#!/bin/bash

# ============================================================================
# version-bump.sh
#
# Automates the version bump workflow for the JavaScript Feature Management
# packages. Updates version in all required files, creates a branch, commits,
# pushes, and opens a PR via the GitHub CLI (gh).
#
# Usage:
#   ./scripts/version-bump.sh <new_version> [--preview]
#
# Examples:
#   ./scripts/version-bump.sh 2.5.0             # stable release → PR to main
#   ./scripts/version-bump.sh 2.5.0-preview.1 --preview  # preview release → PR to preview
#
# Prerequisites:
#   - git, sed, and gh (GitHub CLI) must be installed and authenticated
#
# Packages updated:
#   - @microsoft/feature-management
#   - @microsoft/feature-management-applicationinsights-browser
#   - @microsoft/feature-management-applicationinsights-node
# ============================================================================

set -euo pipefail

# ── Helpers ──────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: $(basename "$0") <new_version> [--preview]

Arguments:
  new_version   The version to bump to (e.g. 2.5.0 or 2.5.0-preview.1)
  --preview     Target the preview branch instead of main

Examples:
  $(basename "$0") 2.5.0                       # stable → PR to main
  $(basename "$0") 2.5.0-preview.1 --preview   # preview → PR to preview
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

NEW_VERSION=""
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
      if [[ -z "$NEW_VERSION" ]]; then
        NEW_VERSION="$1"
      else
        error "Unexpected argument: $1"
      fi
      shift
      ;;
  esac
done

[[ -z "$NEW_VERSION" ]] && usage

# Validate version format: major.minor.patch or major.minor.patch-preview.N
if ! echo "$NEW_VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-preview\.[0-9]+)?$'; then
  error "Invalid version format '$NEW_VERSION'. Expected: X.Y.Z or X.Y.Z-preview.N"
fi

# If version contains -preview, ensure --preview flag is set
if echo "$NEW_VERSION" | grep -qE '\-preview\.'; then
  if [[ "$IS_PREVIEW" == false ]]; then
    error "Version '$NEW_VERSION' looks like a preview version. Did you forget --preview?"
  fi
fi

# ── Resolve paths & context ─────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

FM_DIR="$PROJECT_DIR/src/feature-management"
AI_BROWSER_DIR="$PROJECT_DIR/src/feature-management-applicationinsights-browser"
AI_NODE_DIR="$PROJECT_DIR/src/feature-management-applicationinsights-node"

FM_VERSION_TS="$FM_DIR/src/version.ts"
FM_PACKAGE_JSON="$FM_DIR/package.json"
FM_PACKAGE_LOCK="$FM_DIR/package-lock.json"
AI_BROWSER_VERSION_TS="$AI_BROWSER_DIR/src/version.ts"
AI_BROWSER_PACKAGE_JSON="$AI_BROWSER_DIR/package.json"
AI_NODE_VERSION_TS="$AI_NODE_DIR/src/version.ts"
AI_NODE_PACKAGE_JSON="$AI_NODE_DIR/package.json"

# Determine target branch
if [[ "$IS_PREVIEW" == true ]]; then
  TARGET_BRANCH="preview"
else
  TARGET_BRANCH="main"
fi

# Get git username for branch naming
GIT_USERNAME=$(git config user.name 2>/dev/null || echo "")
if [[ -z "$GIT_USERNAME" ]]; then
  error "Could not determine git user.name. Please set it with: git config user.name <name>"
fi
BRANCH_PREFIX=$(echo "$GIT_USERNAME" | awk '{print $1}' | tr '[:upper:]' '[:lower:]')

BRANCH_NAME="${BRANCH_PREFIX}/version-${NEW_VERSION}"

# ── Show plan ────────────────────────────────────────────────────────────────

info "New version     : $NEW_VERSION"
info "Target branch   : $TARGET_BRANCH"
info "New branch      : $BRANCH_NAME"
echo ""
info "Files to update:"
echo "    $FM_VERSION_TS"
echo "    $FM_PACKAGE_JSON"
echo "    $FM_PACKAGE_LOCK (lines 3 and 9)"
echo "    $AI_BROWSER_VERSION_TS"
echo "    $AI_BROWSER_PACKAGE_JSON (version + dependency)"
echo "    $AI_NODE_VERSION_TS"
echo "    $AI_NODE_PACKAGE_JSON (version + dependency)"
echo ""

# ── Confirm with user ───────────────────────────────────────────────────────

read -rp "Proceed? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""

# ── Create branch from target ───────────────────────────────────────────────

cd "$PROJECT_DIR"

info "Fetching latest $TARGET_BRANCH..."
git fetch origin "$TARGET_BRANCH"

info "Creating branch '$BRANCH_NAME' from origin/$TARGET_BRANCH..."
git checkout -b "$BRANCH_NAME" "origin/$TARGET_BRANCH"

# ── Read current version ────────────────────────────────────────────────────

CURRENT_VERSION=$(grep -oP 'VERSION = "\K[^"]+' "$FM_VERSION_TS")
info "Current version : $CURRENT_VERSION"

if [[ "$CURRENT_VERSION" == "$NEW_VERSION" ]]; then
  error "Current version is already $NEW_VERSION. Nothing to do."
fi

# ── Update version in all files ─────────────────────────────────────────────

# 1. feature-management/src/version.ts
info "Updating feature-management/src/version.ts..."
sed -i "s/export const VERSION = \"$CURRENT_VERSION\"/export const VERSION = \"$NEW_VERSION\"/" "$FM_VERSION_TS"

# 2. feature-management/package.json
info "Updating feature-management/package.json..."
sed -i "0,/\"version\": \"$CURRENT_VERSION\"/s//\"version\": \"$NEW_VERSION\"/" "$FM_PACKAGE_JSON"

# 3-4. feature-management/package-lock.json (lines 3 and 9)
info "Updating feature-management/package-lock.json..."
sed -i "0,/\"version\": \"$CURRENT_VERSION\"/s//\"version\": \"$NEW_VERSION\"/" "$FM_PACKAGE_LOCK"
sed -i "0,/\"version\": \"$CURRENT_VERSION\"/s//\"version\": \"$NEW_VERSION\"/" "$FM_PACKAGE_LOCK"

# 5. applicationinsights-browser/src/version.ts
info "Updating feature-management-applicationinsights-browser/src/version.ts..."
sed -i "s/export const VERSION = \"$CURRENT_VERSION\"/export const VERSION = \"$NEW_VERSION\"/" "$AI_BROWSER_VERSION_TS"

# 6. applicationinsights-browser/package.json (version + dependency)
info "Updating feature-management-applicationinsights-browser/package.json..."
sed -i "0,/\"version\": \"$CURRENT_VERSION\"/s//\"version\": \"$NEW_VERSION\"/" "$AI_BROWSER_PACKAGE_JSON"
sed -i "s/\"@microsoft\/feature-management\": \"$CURRENT_VERSION\"/\"@microsoft\/feature-management\": \"$NEW_VERSION\"/" "$AI_BROWSER_PACKAGE_JSON"

# 7. applicationinsights-node/src/version.ts
info "Updating feature-management-applicationinsights-node/src/version.ts..."
sed -i "s/export const VERSION = \"$CURRENT_VERSION\"/export const VERSION = \"$NEW_VERSION\"/" "$AI_NODE_VERSION_TS"

# 8. applicationinsights-node/package.json (version + dependency)
info "Updating feature-management-applicationinsights-node/package.json..."
sed -i "0,/\"version\": \"$CURRENT_VERSION\"/s//\"version\": \"$NEW_VERSION\"/" "$AI_NODE_PACKAGE_JSON"
sed -i "s/\"@microsoft\/feature-management\": \"$CURRENT_VERSION\"/\"@microsoft\/feature-management\": \"$NEW_VERSION\"/" "$AI_NODE_PACKAGE_JSON"

# ── Verify changes ──────────────────────────────────────────────────────────

info "Verifying updates..."

verify_failed=false

check_version() {
  local file="$1"
  local label="$2"
  if ! grep -q "\"$NEW_VERSION\"" "$file" 2>/dev/null; then
    echo "  ✗ $label"
    verify_failed=true
  else
    echo "  ✓ $label"
  fi
}

# Check version.ts files specifically
for vts in "$FM_VERSION_TS" "$AI_BROWSER_VERSION_TS" "$AI_NODE_VERSION_TS"; do
  if ! grep -q "export const VERSION = \"$NEW_VERSION\"" "$vts"; then
    echo "  ✗ $vts"
    verify_failed=true
  else
    echo "  ✓ $vts"
  fi
done

check_version "$FM_PACKAGE_JSON" "$FM_PACKAGE_JSON"
check_version "$FM_PACKAGE_LOCK" "$FM_PACKAGE_LOCK"
check_version "$AI_BROWSER_PACKAGE_JSON" "$AI_BROWSER_PACKAGE_JSON"
check_version "$AI_NODE_PACKAGE_JSON" "$AI_NODE_PACKAGE_JSON"

if [[ "$verify_failed" == true ]]; then
  error "Some version files were not updated correctly. Please check manually."
fi

info "All version files updated ✓"
echo ""

# ── Commit, push, and create PR ─────────────────────────────────────────────

COMMIT_MSG="Version bump $NEW_VERSION"

info "Committing changes..."
git add \
  "$FM_VERSION_TS" "$FM_PACKAGE_JSON" "$FM_PACKAGE_LOCK" \
  "$AI_BROWSER_VERSION_TS" "$AI_BROWSER_PACKAGE_JSON" \
  "$AI_NODE_VERSION_TS" "$AI_NODE_PACKAGE_JSON"
git commit -m "$COMMIT_MSG"

info "Pushing branch '$BRANCH_NAME'..."
git push origin "$BRANCH_NAME"

info "Creating pull request..."
PR_URL=$(gh pr create \
  --base "$TARGET_BRANCH" \
  --head "$BRANCH_NAME" \
  --title "Version bump $NEW_VERSION" \
  --body "Bump version from \`$CURRENT_VERSION\` to \`$NEW_VERSION\`.

### Changes
- \`src/feature-management/src/version.ts\` – updated VERSION constant
- \`src/feature-management/package.json\` – updated version field
- \`src/feature-management/package-lock.json\` – updated version fields (lines 3 and 9)
- \`src/feature-management-applicationinsights-browser/src/version.ts\` – updated VERSION constant
- \`src/feature-management-applicationinsights-browser/package.json\` – updated version and dependency
- \`src/feature-management-applicationinsights-node/src/version.ts\` – updated VERSION constant
- \`src/feature-management-applicationinsights-node/package.json\` – updated version and dependency

---
*This PR was created automatically by \`scripts/version-bump.sh\`.*")

echo ""
info "Done! PR created: $PR_URL"
