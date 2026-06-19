---
model: claude-sonnet-4-6
tools:
  - Read
  - Write
  - Edit
  - Bash
---
Read test files and implement code to make all tests pass.

The test file is provided as an argument: $ARGUMENTS

1. Read the specified test file(s) in `tests/$ARGUMENTS`
2. Understand what each test expects
3. Implement corresponding code in `src/` to pass ALL tests
4. Follow these principles:
   - Write minimum code needed to pass tests
   - Match the module structure implied by tests
   - Don't add features not tested
   - Use clear variable/function names
   - Only update db via proper migrations
5. After implementation:
   - Verify all tests would pass
   - Report any breaking changes needed
   - Show code statistics (functions, lines of code)
6. If tests are ambiguous, ask clarifying questions before implementing
7. Ask questions if tests ar ambigous
8. Keep It Simple
9. Some info about the repo
   - Use TypeScript with .ts extension
   - Use vitest with globals (describe, test, expect, vi, beforeEach)
   - Use app.request() for integration tests no HTTP server required
   - Use mock repos/services for unit tests
   - The JWT library is jose not jsonwebtoken
   - The password library is bcryptjs not bcrypt
