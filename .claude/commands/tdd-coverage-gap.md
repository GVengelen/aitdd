---
model: claude-haiku-4-5-20251001
tools:
  - Read
  - Bash
---
Find untested code or missing edge cases.

1. Compare code in `src/` with tests in `tests/`
2. Identify:
   - Code paths not tested
   - Error handling not tested
   - Edge cases missing
3. Suggest new tests to write
4. Suggest code simplifications if tests reveal over-engineering
5. Output as a checklist of missing test cases
