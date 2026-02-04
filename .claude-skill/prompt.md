# feng3d Skill

You are helping users create and manage feng3d projects using the feng3d-cli tool.

## Overview

feng3d-cli is a command-line tool that provides:
- Unified code standards (ESLint configuration)
- Unified dependency version management
- Project templates (LICENSE, .gitignore, tsconfig.json, vite.config.js, etc.)
- GitHub Actions workflows (CI/CD, GitHub Pages deployment, OSS upload)
- Git pre-commit hooks (code linting + unit tests)

## Commands

### 1. Create New Project

**Command**: `npx feng3d-cli create <project-name> [options]`

**Description**: Creates a new project following feng3d standards.

**Options**:
- `-d, --directory <dir>` - Project directory (default: current directory)
- `--no-examples` - Do not create examples directory
- `--no-vitest` - Do not include vitest test configuration

**Examples**:
```bash
# Create a new project in current directory
npx feng3d-cli create my-project

# Create project in specific directory
npx feng3d-cli create my-project -d ./packages

# Create without examples
npx feng3d-cli create my-project --no-examples

# Create without vitest
npx feng3d-cli create my-project --no-vitest
```

**What it creates**:
- `package.json` with unified dependencies
- `LICENSE` (MIT in Chinese)
- `.gitignore`
- `.cursorrules`
- `tsconfig.json`
- `vite.config.js`
- `vitest.config.ts` (unless --no-vitest)
- `eslint.config.js`
- `typedoc.json`
- `.vscode/settings.json`
- `.husky/pre-commit` hook
- `scripts/prepublish.js`, `scripts/postpublish.js`, `scripts/postdocs.js`
- `.github/workflows/` (pull-request.yml, publish.yml, pages.yml, upload-oss.yml)
- `src/index.ts`
- `test/_.test.ts`
- `examples/` directory (unless --no-examples)

### 2. Update Existing Project

**Command**: `npx feng3d-cli update [options]`

**Description**: Updates all standard configuration files in an existing project.

**Options**:
- `-d, --directory <dir>` - Project directory (default: current directory)

**Examples**:
```bash
# Update current project
npx feng3d-cli update

# Update specific project
npx feng3d-cli update -d ./my-project
```

**What it updates**:
- All configuration files (ESLint, TypeScript, Vite, etc.)
- GitHub Actions workflows
- Scripts
- Dependencies versions in package.json
- If `examples` directory exists, automatically adds `examples:dev` and `postdocs` scripts

## Usage Guidelines

### When to use CREATE command:
- User wants to start a new feng3d project
- User needs a project with feng3d standards
- Setting up a new package in a monorepo

### When to use UPDATE command:
- User wants to sync with latest feng3d standards
- Project configuration is outdated
- User wants to adopt new feng3d conventions
- After feng3d-cli version update

### Important Notes:
1. **Always use npx**: Run commands with `npx feng3d-cli` to ensure the latest version
2. **Check directory**: Verify the target directory before creating/updating
3. **Backup warning**: Warn users that UPDATE will overwrite configuration files
4. **Git status**: Recommend checking git status before UPDATE
5. **Examples directory**: If project has `examples/`, UPDATE will automatically configure related scripts

## Code Standards

When working with feng3d projects, follow these standards:

### Indentation
- Use 4 spaces

### Quotes
- Use single quotes

### Naming Conventions
- Variables and functions: camelCase
- Classes and interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE

### Git Commit Conventions
- Use Simplified Chinese
- Follow Conventional Commits format
- Types: feat, fix, refactor, perf, style, docs, test, chore, build, ci

### Pre-commit Checks
Before committing, the project automatically runs:
1. ESLint code style check
2. Unit tests via vitest

## Unified Versions

The tool maintains unified versions for:
- TypeScript: 5.8.3
- ESLint: 9.26.0
- Vitest: ^3.1.3
- Vite: ^6.3.5
- TypeDoc: ^0.28.4

## Implementation

When the user invokes this skill:

1. **Understand the request**: Determine if they want to create or update
2. **Confirm details**: Ask for project name (for create) or confirm directory
3. **Execute command**: Use the Bash tool to run `npx feng3d-cli <command>`
4. **Handle output**: Show the command output to the user
5. **Next steps**: Suggest running `npm install` after creation, or checking git diff after update

## Example Interactions

### Example 1: Creating a new project
```
User: Create a new feng3d project called "my-lib"
Assistant: I'll create a new feng3d project for you.
[Uses Bash tool to run: npx feng3d-cli create my-lib]
[Shows output]
Assistant: Project created successfully! Next steps:
1. cd my-lib
2. npm install
3. npm run dev
```

### Example 2: Updating existing project
```
User: Update my project to latest feng3d standards
Assistant: I'll update your project configuration. This will overwrite your configuration files. Make sure you've committed any important changes.
[Uses Bash tool to run: npx feng3d-cli update]
[Shows output]
Assistant: Configuration updated! Review the changes with `git diff` and test your project.
```

## Error Handling

- If the command fails, show the error message and suggest solutions
- If directory doesn't exist, suggest creating it or checking the path
- If package.json is missing for update, suggest running create instead
- If npm/node is not installed, guide user to install them first

## Additional Resources

- Repository: https://github.com/feng3d-labs/feng3d-cli
- Documentation: https://feng3d.com/feng3d-cli/
