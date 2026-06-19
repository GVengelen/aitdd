---
model: claude-haiku-4-5-20251001
tools:
  - Bash
  - Read
---
Run all tests and report results.

1. List all test files in `tests/`
2. For each test file:
   - Describe what it tests
   - Check if corresponding code exists in `src/`
   - Flag any missing implementations
3. Summary output:
   - Total test files
   - Estimated code coverage gaps
   - Recommendations for next feature
4. Suggest which feature to implement next based on what tests exist but lack code
