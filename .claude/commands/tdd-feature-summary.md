---
model: claude-haiku-4-5-20251001
tools:
  - Read
  - Bash
---
Generate a summary of current TDD progress.

1. Scan `features/` directory
2. For each feature:
   - List its requirements
   - Check if tests exist in `tests/`
   - Check if code exists in `src/`
   - Mark status: ✓ Complete | ⚙️ In Progress | ❌ Not Started
3. Create a markdown table showing:
   - Feature name
   - Requirements count
   - Test coverage (estimated %)
   - Implementation status
4. Show next steps
