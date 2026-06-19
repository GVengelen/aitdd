---
model: claude-sonnet-4-6
tools:
  - Read
  - Write
  - Edit
  - Bash
---
Run Stryker mutation testing and fix every surviving mutant — by adding a test, tightening the source, or marking a confirmed false positive.

An optional module/file glob can be narrowed with $ARGUMENTS (e.g. `users` targets `src/**/*users*.ts`).

## Steps

1. **Determine scope**
   - If $ARGUMENTS is provided, pass `--mutate 'src/**/*$ARGUMENTS*.ts'` to Stryker.
   - Otherwise run against the full default config (`stryker.config.json` mutates `src/**/*.ts`).

2. **Run Stryker**
   ```
   npm run test:mutation
   ```
   Capture stdout. The clear-text reporter lists each surviving mutant with file, line, original code, and mutated code.

3. **For each surviving mutant, classify and fix it**

   Read the source file at the reported line. Decide which of the three actions applies:

   ### A — Add a missing test
   Use when the mutant represents a real behavioural difference that the suite should catch (wrong operator, removed condition, missing return, etc.).
   - Write a new test case in the closest existing test file that exercises the exact condition the mutant changed.
   - The test must fail with the mutant applied and pass with the original code.
   - Follow the test file's existing style (describe/it blocks, assertion library, no unnecessary mocks).

   ### B — Tighten the source code
   Use when the surviving mutant reveals that the production code is looser than it needs to be — e.g. a condition that is logically equivalent after mutation because the surrounding code already guarantees the value. Simplify or strengthen the source so the mutant no longer compiles or is no longer equivalent.

   ### C — Mark as false positive
   Use when the mutant is genuinely equivalent (the mutated code produces identical observable behaviour in all valid inputs) — e.g. changing `i++` to `i--` inside dead code, or mutating a log-only string. Add a Stryker disable comment on the specific line:
   ```ts
   // Stryker disable next-line <MutatorName>: <one-line reason>
   ```
   Be conservative: prefer A or B. Only use C when you are certain the mutation cannot affect any observable output.

4. **Re-run Stryker after fixes**
   ```
   npm run test:mutation
   ```
   Repeat steps 2–3 until no surviving mutants remain (or all remaining ones are marked with disable comments).

5. **For no-coverage mutants**
   - If the uncovered code path is reachable, add a test that exercises it (action A).
   - If it is genuinely dead code, remove it from the source.

6. **Final summary**
   After the last clean run, print:
   ```
   Mutation score : XX %
   Killed         : N
   Survived       : 0
   No coverage    : N
   False positives disabled : N
   ```
   List every file changed and what kind of fix was applied (test added / source tightened / false positive marked).
