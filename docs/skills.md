---
name: TDD Agent Commands
description: Custom slash commands for orchestrating test-first development workflow
version: 1.0
---

# /tdd-create-feature

Create a well-structured feature specification file interactively.

**Usage:** `/tdd-create-feature user-authentication`

**Instructions for Claude:**

1. Ask clarifying questions about the feature (in a conversational way):

   - What does this feature do in simple terms?
   - Who are the users/roles that interact with it?
   - What problem does it solve or value does it provide?
   - What are 4-6 core requirements? (Ask for specifics)
   - What should fail gracefully? What are edge cases?
   - Are there dependencies or integrations? (Database, APIs, etc.)

2. As the user responds, build the feature file using FEATURE_TEMPLATE.md structure:

   - **Summary**: One clear sentence
   - **User Story**: As [role] I want [action] so that [benefit]
   - **Requirements**: Convert answers into a checklist (5-8 items)
   - **Acceptance Criteria**: Transform into Gherkin format (Given/When/Then)
     - At least one happy path scenario
     - At least one error scenario
     - One edge case scenario
   - **Edge Cases**: List specific scenarios from conversation
   - **Technical Details**: Ask about language, module name, framework
   - **Example Usage**: Create realistic, copy-paste-ready code examples

3. Save to: `features/{name}.md`

4. Show the generated file and ask:
   - "Does this look right? Any changes?"
   - "Ready to generate tests with `/tdd-feature-to-tests`?"

**Best Practices for Claude:**

- Ask clarifying questions instead of making assumptions
- If answer is vague, drill down ("Can you give a specific example?")
- Acceptance criteria should be testable, not aspirational
- Each requirement should have at least one acceptance criterion
- Examples should use realistic data
- Consider the "sad path" - what can go wrong?

---

# /tdd-feature-to-tests

Read a feature specification and generate comprehensive tests.

**Usage:** `/tdd-feature-to-tests user-authentication`

**Instructions for Claude:**

1. Read the feature file from `features/{name}.md`
2. Extract all requirements and acceptance criteria
3. Generate test files in `tests/` covering:
   - Happy path scenarios
   - Error cases and edge cases
   - Boundary conditions
   - Integration points
4. Use the appropriate test framework (Vitest)
5. Ensure each test is:
   - Isolated and independent
   - Descriptive name explaining what's tested
   - Single assertion principle (test one thing)
6. Don't implement code - only tests
7. Show a summary of test files created with line counts

---

# /tdd-tests-to-code

Read test files and implement code to make all tests pass.

**Usage:** `/tdd-tests-to-code test-user-auth.js`

**Instructions for Claude:**

1. Read the specified test file(s) in `tests/`
2. Understand what each test expects
3. Implement corresponding code in `src/` to pass ALL tests
4. Follow these principles:
   - Write minimum code needed to pass tests
   - Match the module structure implied by tests
   - Don't add features not tested
   - Use clear variable/function names
5. After implementation:
   - Verify all tests would pass
   - Report any breaking changes needed
   - Show code statistics (functions, lines of code)
6. If tests are ambiguous, ask clarifying questions before implementing

---

# /tdd-validate

Run all tests and report results.

**Usage:** `/tdd-validate`

**Instructions for Claude:**

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

---

# /tdd-feature-summary

Generate a summary of current TDD progress.

**Usage:** `/tdd-feature-summary`

**Instructions for Claude:**

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

---

# /tdd-refactor

Refactor code while keeping all tests passing.

**Usage:** `/tdd-refactor consolidate-auth-logic`

**Instructions for Claude:**

1. Take a description of the refactor
2. Read current code in `src/`
3. Read all related tests in `tests/`
4. Make the refactoring changes
5. Verify no tests would break
6. Report:
   - Files changed
   - Lines added/removed
   - Any behavior changes
7. Keep all tests passing - no modifications to tests allowed

---

# /tdd-coverage-gap

Find untested code or missing edge cases.

**Usage:** `/tdd-coverage-gap`

**Instructions for Claude:**

1. Compare code in `src/` with tests in `tests/`
2. Identify:
   - Code paths not tested
   - Error handling not tested
   - Edge cases missing
3. Suggest new tests to write
4. Suggest code simplifications if tests reveal over-engineering
5. Output as a checklist of missing test cases
