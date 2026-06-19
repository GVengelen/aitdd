# Repository Index

**Last Updated:** 2026-06-20 11:33:19

Claude reads this file instead of exploring the repo structure. Update when adding new features or major changes.

## Directory Structure

```
project/
├── features/              [Feature specifications]
│   └── *.md              (Feature files)
│
├── tests/                [Test files]
│   ├── unit/             (Unit tests for single modules)
│   └── integration/      (Integration tests for workflows)
│
├── src/                  [Implementation code]
│   ├── core/             (Core business logic)
│   ├── utils/            (Utility functions)
│   └── api/              (API endpoints or exports)
│
├── scripts/              [Automation scripts]
│   ├── init-tdd-repo.sh
│   └── run-tests.sh
│
├── .claude/              [Claude Code configuration]
│   ├── skills.md         (Custom commands)
│   ├── context.txt       (Quick reference)
│   ├── index.md          (This file)
│   └── settings.json     (Settings)
│
└── docs/                 [Documentation]
    ├── CLAUDE.md         (Agent instructions)
    ├── README.md         (Setup guide)
    └── ...
```

## Features (Completed & In Progress)

### Status Guide

- ✅ Complete (feature spec + tests + code + passing)
- ⚙️ In Progress (spec + tests, no code yet)
- 📋 Spec Only (feature spec written, no tests)
- ❌ Not Started (mentioned but not started)

### Feature List

[This section auto-updates - do a `git ls-files features/` to see current features]

Current features:

- `example-feature.md` - String reversal utility (example/reference)

New features as you create them will appear here.

## Test Coverage Map

### Unit Tests

- `tests/unit/` - Individual function/module tests
- Each test file corresponds to one `src/` module
- Naming: `test-<module-name>.js`

### Integration Tests

- `tests/integration/` - Workflow and API tests
- Naming: `test-<feature-name>.js` or `integration-<flow>.js`

## Code Organization

### Module Structure

When implementing features, follow this pattern:

```javascript
// src/my-feature.js
module.exports = {
  functionA,   // Exported functions
  functionB,
  Class,       // Exported classes
};

// tests/test-my-feature.js
const { functionA, functionB, Class } = require('../src/my-feature');

describe('My Feature', () => {
  test('functionA does X', () => { ... });
  test('functionB does Y', () => { ... });
});
```

### Naming Conventions

- **Feature files**: `features/snake-case.md`
- **Test files**: `tests/test-snake-case.js`
- **Code files**: `src/snake-case.js`
- **Functions**: `camelCase()`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`

## Dependencies & Frameworks

### JavaScript/Node

- **Test Framework**: Vitest (configured in `package.json`)
- **Node Version**: 18+

### Python (if applicable)

- **Test Framework**: pytest
- **Python Version**: 3.8+

### External Dependencies

[List any npm packages or imports used]

- (None by default - add as needed)

## Common Tasks & Where They Are

| Task              | Location    | File                           |
| ----------------- | ----------- | ------------------------------ |
| Add new feature   | Run command | `/tdd-create-feature <name>`   |
| Generate tests    | Run command | `/tdd-feature-to-tests <name>` |
| Generate code     | Run command | `/tdd-tests-to-code <file>`    |
| Run all tests     | Command     | `npm test`                     |
| View feature spec | File        | `features/my-feature.md`       |
| View tests        | File        | `tests/test-*.js`              |
| View code         | File        | `src/*.js`                     |

## Patterns & Conventions

### Feature Spec Pattern

````markdown
# Feature: Name

## Summary

One sentence.

## User Story

As [role] I want [action] so that [benefit]

## Requirements

- [ ] Requirement 1

## Acceptance Criteria

```gherkin
Given [state] When [action] Then [result]
```
````

## Edge Cases

- Edge case 1

````

### Test File Pattern
```javascript
const { function } = require('../src/module');

describe('Module Name', () => {
  describe('Happy Path', () => {
    test('does X', () => {
      expect(function()).toBe(expected);
    });
  });

  describe('Error Cases', () => {
    test('handles Y', () => {
      expect(() => function(bad)).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('handles Z', () => {
      // ...
    });
  });
});
````

### Code Pattern

```javascript
/**
 * Does something useful
 * @param {type} param - Description
 * @returns {type} Description
 */
function doSomething(param) {
  // Minimal implementation to pass tests
  // No extra features not tested
}

module.exports = { doSomething };
```

## Configuration Files

### .claude/skills.md

Defines custom slash commands:

- `/tdd-create-feature` - Interactive feature spec creation
- `/tdd-feature-to-tests` - Generate tests from spec
- `/tdd-tests-to-code` - Generate code from tests
- `/tdd-validate` - Check coverage gaps
- `/tdd-refactor` - Safe refactoring

### .claude/context.txt

Quick reference for assumed structure.

### .claude/settings.json

Claude Code behavior settings.

### CLAUDE.md

Instructions for Claude agents (token optimization, conventions).

## Git Workflow

### Commit Strategy

```bash
# Phase 0: Feature spec
git commit -m "docs: add feature spec for <name>"

# Phase 1: Tests
git commit -m "test: add tests for <name>"

# Phase 2: Code
git commit -m "feat: implement <name>"
```

### Branch Strategy

```bash
git checkout -b feature/my-feature
# ... do the work ...
git push origin feature/my-feature
# Create pull request
```

## How to Use This Index

### For Claude (Agent Usage)

1. Read this file first to understand structure
2. Don't explore with `ls` - this file has the info
3. If structure changes, file is updated
4. Refer to sections above instead of asking

### For You (Developer)

1. Keep this file updated when adding features
2. Add new sections if structure changes
3. Run `./scripts/index-repo.sh` to auto-update (if implemented)
4. Commit index changes with related code

## Quick Stats

- **Total Features**: 2
- **Test Files**: 9
- **Code Files**: 0
- **Commands**: 7 custom Claude commands defined

## Next Steps

1. **Create a feature**: Run `/tdd-create-feature <name>`
2. **Generate tests**: Run `/tdd-feature-to-tests <name>`
3. **Generate code**: Run `/tdd-tests-to-code test-<name>.js`
4. **Run tests**: `npm test`
5. **Commit**: `git add . && git commit -m "..."`

---

**Note**: This file is read by Claude at the start of each session. Keep it current by updating when the repo structure changes.
