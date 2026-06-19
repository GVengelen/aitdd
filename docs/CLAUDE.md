# TDD Workshop Agent Orchestration

## Overview
This repository uses a two-agent TDD workflow:
- **Agent 1 (Test Writer)**: Analyzes feature specs and creates comprehensive tests
- **Agent 2 (Code Writer)**: Implements code to pass the tests

## Workflow

### Phase 1: Feature → Tests
1. Create or select a feature file in `features/` (see FEATURE_TEMPLATE.md)
2. Run: `claude /tdd-feature-to-tests <feature-name>`
3. Agent 1 reads the feature spec and writes tests to `tests/`
4. Review generated tests - edit/refine as needed
5. Commit tests to git (important - marks test contract)

### Phase 2: Tests → Code
1. Run: `claude /tdd-tests-to-code <test-file>`
2. Agent 2 reads the passing tests and implements matching code in `src/`
3. All tests should pass after implementation
4. Review diffs carefully - tests define the contract

## Permission Mode
Start in **plan mode**:
- Agents describe changes before implementing
- You review and can add comments like "skip this file" 
- Safer for workshop/learning scenarios

Switch to **auto-accept** once confident in patterns.

## Project Structure
```
project/
├── features/              # Feature specifications
│   └── feature-name.md
├── tests/                 # Test files (written first)
│   ├── unit/
│   └── integration/
├── src/                   # Implementation (written second)
│   └── ...
├── scripts/               # Helper scripts
│   ├── run-tests.sh
│   └── validate-coverage.sh
├── CLAUDE.md             # This file - agent instructions
└── .claudeignore         # Files to exclude from context
```

## Custom Commands

### /tdd-feature-to-tests
```
/tdd-feature-to-tests <feature-name>
```
Reads `features/<feature-name>.md`, generates comprehensive tests.

### /tdd-tests-to-code
```
/tdd-tests-to-code <test-file>
```
Reads test file, implements code in `src/` to pass all tests.

### /tdd-validate
```
/tdd-validate
```
Runs all tests and reports coverage gaps.

## Important Conventions

1. **Test-First**: Always create tests before code
2. **Single Responsibility**: Each feature file = one focused feature
3. **No Skipping Tests**: All tests must pass, none skipped
4. **Review Diffs**: Even in auto-accept, spot-check the first few implementations
5. **Commit Between Phases**: Git commit after Phase 1 (tests) before Phase 2 (code)

## Test File Naming
- Unit tests: `test-<module-name>.js`
- Integration tests: `integration-<feature-name>.js`
- E2E tests: `e2e-<user-flow>.js`

## Code Organization
Map test files to src structure:
- `tests/test-utils.js` → `src/utils.js`
- `tests/test-api.js` → `src/api/index.js`
- Keep 1:1 relationship for clarity

## Troubleshooting

**Tests not passing after code generation?**
- Agent 2 may have misunderstood the test contract
- Run `/tdd-validate` to see which tests fail
- Add a comment in the test file explaining the intent
- Re-run `/tdd-tests-to-code` with the clarified tests

**Agent generating too much code?**
- In plan mode, comment "keep implementation minimal" on the plan
- Break features into smaller specs

**Context window filling?**
- Run `/compact` before large refactors
- Keep feature specs focused and concise
