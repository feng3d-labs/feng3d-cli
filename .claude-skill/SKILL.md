---
name: "feng3d-cli"
description: "Create and update feng3d projects with unified standards, including ESLint, TypeScript, Vite, GitHub Actions, and pre-commit hooks. Automate project setup and configuration management for feng3d development."
version: "0.1.2"
author: "feng"
category: "Development"
tags:
  - project-setup
  - scaffolding
  - standards
  - typescript
  - vite
  - eslint
  - automation
  - cli
complexity: "simple"
repository: "https://github.com/feng3d-labs/feng3d-cli"
---

# feng3d-cli Skill

Automate the creation and management of feng3d projects with unified standards.

## What This Skill Does

This skill enables Claude to help you:
- Create new feng3d projects with complete standard configurations
- Update existing projects to latest feng3d standards
- Manage unified dependency versions across projects
- Set up GitHub Actions workflows (CI/CD, Pages deployment, OSS upload)
- Configure development tools (ESLint, TypeScript, Vite, Vitest, Husky)

## When to Use This Skill

Use this skill when:
- Starting a new feng3d project
- Updating project configurations to match team standards
- Standardizing multiple projects across a monorepo
- Setting up CI/CD pipelines for feng3d projects

## Commands

### Create New Project
```bash
npx feng3d-cli create <project-name> [options]
```

Options:
- `-d, --directory <dir>` - Project directory (default: current directory)
- `--no-examples` - Don't create examples directory
- `--no-vitest` - Don't include vitest test configuration

### Update Existing Project
```bash
npx feng3d-cli update [options]
```

Options:
- `-d, --directory <dir>` - Project directory (default: current directory)

### Install This Skill
```bash
npx feng3d-cli skill
```

## What Gets Created/Updated

### Project Structure
- `package.json` - Unified dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.js` - Vite build configuration
- `vitest.config.ts` - Vitest test configuration
- `eslint.config.js` - ESLint linting rules
- `typedoc.json` - Documentation generation

### Templates
- `LICENSE` - MIT license (Chinese)
- `.gitignore` - Git ignore rules
- `.cursorrules` - Cursor AI rules
- `.vscode/settings.json` - VS Code settings
- `.husky/pre-commit` - Pre-commit hooks (lint + test)

### Scripts
- `scripts/prepublish.js` - Pre-publish script
- `scripts/postpublish.js` - Post-publish script
- `scripts/postdocs.js` - Post-documentation script

### GitHub Actions
- `.github/workflows/pull-request.yml` - PR checks
- `.github/workflows/publish.yml` - Publish to npm
- `.github/workflows/pages.yml` - Deploy docs to GitHub Pages
- `.github/workflows/upload-oss.yml` - Upload to Aliyun OSS

## Code Standards

### Indentation
- Use 4 spaces

### Quotes
- Use single quotes

### Naming Conventions
- Variables and functions: camelCase
- Classes and interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE

### Git Commit Convention
- Use Simplified Chinese
- Follow Conventional Commits format
- Types: feat, fix, refactor, perf, style, docs, test, chore, build, ci

### Pre-commit Checks
Before committing, automatically runs:
1. ESLint code style check
2. Unit tests via vitest

## Unified Versions

| Dependency | Version |
|------------|---------|
| TypeScript | 5.8.3 |
| ESLint | 9.26.0 |
| Vitest | ^3.1.3 |
| Vite | ^6.3.5 |
| TypeDoc | ^0.28.4 |

## Examples

### Example 1: Create a new library project
```
User: Create a feng3d library project called "my-3d-engine"

Claude: I'll create a new feng3d project for you.
[Executes: npx feng3d-cli create my-3d-engine]

Project created! Next steps:
1. cd my-3d-engine
2. npm install
3. npm run dev
```

### Example 2: Update project standards
```
User: Update my current project to latest feng3d standards

Claude: I'll update your project configuration. Make sure you've committed changes first.
[Executes: npx feng3d-cli update]

Configuration updated! Review changes with `git diff`.
```

### Example 3: Create without examples
```
User: Create a feng3d project without the examples directory

Claude: [Executes: npx feng3d-cli create my-project --no-examples]
```

## OSS Upload Configuration

To enable OSS upload in GitHub Actions, configure these secrets in your repository:
- `OSS_REGION` - OSS region (e.g., `oss-cn-hangzhou`)
- `OSS_ACCESS_KEY_ID` - Aliyun AccessKey ID
- `OSS_ACCESS_KEY_SECRET` - Aliyun AccessKey Secret
- `OSS_BUCKET` - OSS Bucket name

## Installation

### Quick Install
```bash
npx feng3d-cli skill
```

### Manual Install
```bash
mkdir -p ~/.claude/skills
cp -r .claude-skill ~/.claude/skills/feng3d
```

## Resources

- [GitHub Repository](https://github.com/feng3d-labs/feng3d-cli)
- [Documentation](https://feng3d.com/feng3d-cli/)
- [npm Package](https://www.npmjs.com/package/feng3d-cli)

## License

MIT
