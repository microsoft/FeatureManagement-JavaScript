---
name: prepare-release
description: Prepare a release for the JavaScript Feature Management packages. Use when user mentions release preparation, version bump, creating merge PRs, preview release, or stable release for this project.
---

# Prepare Release

This skill automates the release preparation workflow for the [JavaScript Feature Management](https://github.com/microsoft/FeatureManagement-JavaScript) project.

## When to Use This Skill

Use this skill when you need to:
- Bump the package version for a new stable or preview release
- Create merge PRs to sync branches (main → release, preview → release)
- Prepare all the PRs needed before publishing a new release

## Background

### Repository Information
- **GitHub Repo**: https://github.com/microsoft/FeatureManagement-JavaScript
- **Packages**:
  - `@microsoft/feature-management`
  - `@microsoft/feature-management-applicationinsights-browser`
  - `@microsoft/feature-management-applicationinsights-node`

### Branch Structure
- `main` – primary development branch for stable releases
- `preview` – development branch for preview releases
- `release/v{major}` – release branch (e.g., `release/v2`)

### Version Files
The version must be updated in **all 7 files** simultaneously. Some files have multiple locations that need updating:

1. `src/feature-management/src/version.ts` – line 4: `export const VERSION = "<version>";`
2. `src/feature-management/package.json` – line 3: `"version": "<version>",`
3. `src/feature-management/package-lock.json` – line 3: `"version": "<version>",`
4. `src/feature-management/package-lock.json` – line 9: `"version": "<version>",`
5. `src/feature-management-applicationinsights-browser/src/version.ts` – line 4: `export const VERSION = "<version>";`
6. `src/feature-management-applicationinsights-browser/package.json` – line 3: `"version": "<version>",` AND the `@microsoft/feature-management` dependency version
7. `src/feature-management-applicationinsights-node/src/version.ts` – line 4: `export const VERSION = "<version>";`
8. `src/feature-management-applicationinsights-node/package.json` – line 3: `"version": "<version>",` AND the `@microsoft/feature-management` dependency version

### Version Format
- **Stable**: `{major}.{minor}.{patch}` (e.g., `2.4.0`)
- **Preview**: `{major}.{minor}.{patch}-preview.{prerelease}` (e.g., `2.4.0-preview.1`)

## Quick Start

Ask the user whether this is a **stable** or **preview** release, and what the **new version number** should be. Then follow the appropriate workflow below.

---

### Workflow A: Stable Release

#### Step 1: Version Bump PR

Create a version bump PR targeting `main` by running the version bump script:

```bash
./scripts/version-bump.sh <new_version>
```

For example: `./scripts/version-bump.sh 2.5.0`

The script will automatically:
1. Read the current version from `src/feature-management/src/version.ts`.
2. Create a new branch from `main` named `<username>/version-<new_version>`.
3. Update the version in all 7 files (see [Version Files](#version-files) section above).
4. Commit, push, and create a PR to `main` with title: `Version bump <new_version>`.

When the script prompts `Proceed? [y/N]`, confirm by entering `y`.

**Sample PR**: https://github.com/microsoft/FeatureManagement-JavaScript/pull/120

#### Step 2: Merge Main to Release Branch

After the version bump PR is merged, create a PR to merge `main` into the release branch by running:

```bash
./scripts/merge-to-release.sh <new_version>
```

For example: `./scripts/merge-to-release.sh 2.5.0`

When the script prompts `Proceed? [y/N]`, confirm by entering `y`.

> **Important**: Use "Merge commit" (not squash) when merging this PR to preserve commit history.

---

### Workflow B: Preview Release

#### Step 1: Version Bump PR

Create a version bump PR targeting `preview` by running the version bump script with the `--preview` flag:

```bash
./scripts/version-bump.sh <new_version> --preview
```

For example: `./scripts/version-bump.sh 2.5.0-preview.1 --preview`

When the script prompts `Proceed? [y/N]`, confirm by entering `y`.

#### Step 2: Merge Preview to Release Branch

After the version bump PR is merged, create a PR to merge `preview` into the release branch by running:

```bash
./scripts/merge-to-release.sh <new_version> --preview
```

For example: `./scripts/merge-to-release.sh 2.5.0-preview.1 --preview`

When the script prompts `Proceed? [y/N]`, confirm by entering `y`.

> **Important**: Use "Merge commit" (not squash) when merging this PR to preserve commit history.

---

## Review Checklist

Each PR should be reviewed with the following checks:
- [ ] Version is updated consistently across all 7 files
- [ ] The `@microsoft/feature-management` dependency version in both applicationinsights packages matches the new version
- [ ] No unintended file changes are included
- [ ] Merge PRs use **merge commit** strategy (not squash)
- [ ] Branch names follow the naming conventions
- [ ] All CI checks pass
