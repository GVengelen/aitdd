---
model: claude-sonnet-4-6
tools:
  - Read
  - Edit
  - Bash
---
Refactor code while keeping all tests passing.

The refactor description is provided as an argument: $ARGUMENTS

1. Read current code in `src/`
2. Read all related tests in `tests/`
3. Make the refactoring changes described in the argument
4. Verify no tests would break
5. Report:
   - Files changed
   - Lines added/removed
   - Any behavior changes
6. Keep all tests passing - no modifications to tests allowed
