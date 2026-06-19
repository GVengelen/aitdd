# TDD Project

Test-driven development workflow. Features become tests, tests become code.

## Structure

```
features/   Feature specs (Markdown)
tests/      Test files (Vitest)
src/        Implementation
```

Naming maps across all three: `features/login.md` → `tests/test-login.js` → `src/login.js`. Test files import from `src/`.

## Workflow

1. `/tdd-feature-to-tests <name>` — read `features/<name>.md`, write `tests/test-<name>.js`
2. `/tdd-tests-to-code <test-file>` — read the test file, write `src/<module>.js` to pass it

Tests come first and define the contract. Implementation is the minimum needed to pass them—no untested features.

## Rules

- Never modify a test to make code pass. The test is the spec; fix the code.
- One concern per test, descriptive names, cover happy path + errors + edge cases.
- Don't add functionality the tests don't exercise.
- When tests and code disagree, the tests are right.
- Work silently, only explain when asked.

## Working style

- Read the full test file before writing any implementation. The answer to "how should this behave" is in the tests—find it there, don't reason about what it might be.
- If a test's intent is genuinely ambiguous after reading it, stop and ask one question. Don't write paragraphs weighing possibilities.
- Keep responses to what you did and why. No step-by-step narration of your thinking, no "let me reconsider", no restating the plan back.

## Commands

- `npm test` — run the suite
- `/tdd-refactor <description>` — change code while keeping tests green
