---
model: claude-sonnet-4-6
tools:
  - Read
  - Write
  - Bash
---
Read a feature specification and generate comprehensive tests.

The feature name is provided as an argument: $ARGUMENTS

1. Read the feature file from `features/$ARGUMENTS.md`
2. Extract all requirements and acceptance criteria
3. Generate test files in `tests/` covering:
   - Happy path scenarios
   - Error cases and edge cases
   - Boundary conditions
   - Integration points
   - String literals
4. Use the appropriate test framework (Vitest)
5. Ensure each test is:
   - Isolated and independent
   - Descriptive name explaining what's tested
   - Single assertion principle (test one thing)
   - Don't use mocks if you can avoid them(prefer test containers)
6. Don't implement code - only tests
7. Show a summary of test files created with line counts
