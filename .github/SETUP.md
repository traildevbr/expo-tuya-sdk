# GitHub Actions Setup

## Required Secrets

### `NPM_TOKEN`

Required for the **Release** workflow to publish to npm.

1. Go to [npmjs.com](https://www.npmjs.com) → Account → Access Tokens
2. Generate a new **Automation** token (works with 2FA enabled)
3. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `NPM_TOKEN`
   - Value: the token from step 2

## Workflows

### CI (`ci.yml`)
Runs on every push to `main` and on every PR:
- **TypeScript**: lint + build module + build plugin
- **Android**: compiles Kotlin via Gradle
- **iOS**: pod install + xcodebuild compile (macOS runner)

### Release (`release.yml`)
Triggered by pushing a version tag:
```bash
# Bump version in package.json first, then:
git tag v0.2.0
git push origin v0.2.0
```
This will:
1. Build the module and plugin
2. Verify the tag matches `package.json` version
3. Publish to npm
4. Create a GitHub Release with auto-generated notes

### PR Check (`pr-check.yml`)
Warns if source files were changed without bumping `package.json` version.

## Release Flow

```bash
# 1. Make your changes
# 2. Bump version
npm version patch   # 0.1.0 → 0.1.1
# or
npm version minor   # 0.1.0 → 0.2.0
# or
npm version major   # 0.1.0 → 1.0.0

# 3. Push with tags
git push origin main --follow-tags
```

`npm version` automatically creates a git tag and commit.
