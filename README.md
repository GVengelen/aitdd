# TDD Workshop with Claude Code Agents

A complete repository setup for test-driven development using Claude Code's VS Code extension with a two-agent workflow: one agent generates tests, the other writes code to pass them.

## Quick Start

### 1. Prerequisites
- Node.js 18+ (or Python 3.8+ if using pytest)
- VS Code 1.98.0+
- Claude Code extension installed from VS Code marketplace (Cmd+Shift+X or Ctrl+Shift+X)
- Claude account with Pro/Max subscription or Console account

### 2. Initialize Repository
```bash
chmod +x scripts/init-tdd-repo.sh
./scripts/init-tdd-repo.sh
```

This creates the full directory structure and installs dependencies.

### 3. Start Using Claude Code
```bash
code .
```

Click the Spark icon in the editor toolbar (top-right) to open Claude Code. The extension provides:
- Visual side-by-side diff review for each change
- Plan mode for reviewing proposed changes before implementing
- Multi-tab conversation history

## The TDD Workflow

### Phase 1: Feature Specification → Test Generation

**Step 1:** Create a feature file in `features/`

Use [FEATURE_TEMPLATE.md](./FEATURE_TEMPLATE.md) as your guide:
```bash
cp FEATURE_TEMPLATE.md features/my-feature.md
# Edit features/my-feature.md with your feature description
```

**Step 2:** Invoke Agent 1 (Test Writer)

In Claude Code, use the custom command:
```
/tdd-feature-to-tests my-feature
```

Agent 1 will:
- Read your feature specification from `features/my-feature.md`
- Analyze all requirements and acceptance criteria
- Generate comprehensive test files in `tests/`
- Cover happy paths, edge cases, and error scenarios

**Step 3:** Review and refine tests

Review the generated tests. If needed:
- Edit test files directly in the editor
- Ask Claude to adjust test coverage
- Run tests to see what's needed

**Step 4:** Commit tests

```bash
git add tests/
git commit -m "test: add tests for my-feature"
```

This marks the test contract before implementation begins.

### Phase 2: Tests → Code Implementation

**Step 1:** Invoke Agent 2 (Code Writer)

```
/tdd-tests-to-code test-my-feature.js
```

Agent 2 will:
- Read all tests in the specified file
- Understand the expected behavior
- Implement code in `src/` to pass all tests
- Write only the minimum code needed

**Step 2:** Review implementation diffs

The VS Code extension shows side-by-side diffs with accept/reject buttons. For each diff:
- Review the changes
- Check for unintended side effects
- Accept individual hunks or the whole file

**Step 3:** Run tests

```bash
npm test
```

All tests should pass. If not:
- Fix the issue in `src/`
- Run `/tdd-tests-to-code` again, or
- Ask Claude to fix specific failing tests

**Step 4:** Commit code

```bash
git add src/
git commit -m "feat: implement my-feature"
```

## Custom Commands Reference

### /tdd-feature-to-tests
```
/tdd-feature-to-tests user-authentication
```
Generates tests from a feature specification.

### /tdd-tests-to-code
```
/tdd-tests-to-code test-user-auth.js
```
Implements code to pass the specified tests.

### /tdd-validate
```
/tdd-validate
```
Scans test files and identifies missing implementations or coverage gaps.

### /tdd-coverage-gap
```
/tdd-coverage-gap
```
Compares code against tests to find untested paths.

### /tdd-feature-summary
```
/tdd-feature-summary
```
Shows progress across all features: which are tested, implemented, or need work.

### /tdd-refactor
```
/tdd-refactor consolidate-utils
```
Refactors code while keeping all tests passing.

## Directory Structure

```
project/
├── features/                    # Feature specifications
│   ├── example-feature.md      # Start with this
│   ├── user-auth.md
│   └── payment-processing.md
├── tests/                       # Test files (Agent 1 output)
│   ├── unit/
│   │   ├── test-utils.js
│   │   └── test-validators.js
│   └── integration/
│       └── test-api-endpoints.js
├── src/                         # Implementation code (Agent 2 output)
│   ├── utils.js
│   ├── validators.js
│   └── api/
│       └── endpoints.js
├── scripts/
│   ├── init-tdd-repo.sh        # Setup script
│   └── run-tests.sh            # Test runner
├── .claude/
│   └── skills.md               # Custom slash commands
├── .vscode/
│   └── settings.json           # VS Code config
├── CLAUDE.md                   # Agent instructions (READ THIS)
├── FEATURE_TEMPLATE.md         # Feature spec template
├── .claudeignore               # Files excluded from context
├── .gitignore
├── package.json
└── README.md                   # This file
```

## Permission Modes

When you open Claude Code, choose your permission mode at the bottom of the prompt input:

### Normal Mode (Recommended for Learning)
- Claude asks before each file modification
- You see diffs with accept/reject buttons
- Safer while learning the workflow
- Best for workshops

### Plan Mode
- Claude describes the full plan before making changes
- Plan appears as an editable markdown document
- You can add comments: "skip this file" or "add validation here"
- Better for large refactors

### Auto-Accept Mode
- Claude's changes apply immediately
- No per-file approval
- Use once you trust the patterns
- Requires Sonnet 4.6 or Opus 4.6

## Important Workflows

### Testing the Example

Get familiar with the workflow using the pre-created example:

```bash
# 1. Review the example feature
cat features/example-feature.md

# 2. In Claude Code:
/tdd-feature-to-tests example-feature

# 3. Review generated tests
ls tests/test-*.js

# 4. Generate code
/tdd-tests-to-code test-string-utils.js

# 5. Run tests
npm test

# Should see: ✅ All tests passed
```

### Creating a New Feature

```bash
# 1. Copy template
cp FEATURE_TEMPLATE.md features/my-feature.md

# 2. Edit your feature spec with requirements and acceptance criteria

# 3. In Claude Code:
/tdd-feature-to-tests my-feature

# 4. Review, refine, and commit tests:
git add tests/
git commit -m "test: add tests for my-feature"

# 5. Generate code:
/tdd-tests-to-code test-my-feature.js

# 6. Commit implementation:
git add src/
git commit -m "feat: implement my-feature"
```

### Handling Test Failures

If generated code doesn't pass tests:

```
You: The test expects validation to throw on negative numbers, but your code doesn't check.

Claude will then:
/tdd-tests-to-code test-validators.js
```

Claude will fix the implementation. You review the new diff and accept.

### Refactoring

Keep tests passing while improving code:

```
/tdd-refactor consolidate-helper-functions
```

Claude refactors `src/` while verifying all tests still pass.

## Configuration Files

### CLAUDE.md
The main instructions file that Claude reads. Defines:
- The two-phase workflow (tests first, code second)
- Custom command definitions
- Project conventions
- Permission mode recommendations

See [CLAUDE.md](./CLAUDE.md) for full details.

### .claude/skills.md
Defines custom slash commands (`/tdd-feature-to-tests`, etc.). These guide Claude's behavior when you invoke them. Modify this to customize agent behaviors.

### .claudeignore
Files excluded from Claude's context window (node_modules, build artifacts, etc.). Keeps context focused on your code.

### package.json
Test framework configuration. Modify to use Mocha, Vitest, pytest, etc.

## Troubleshooting

### "Claude Code not showing up after installation?"
- Restart VS Code or run "Developer: Reload Window" from Command Palette
- The Spark icon only appears when a file is open

### "Custom commands not working?"
- Verify `.claude/skills.md` exists in the project root
- Check that command names match exactly: `/tdd-feature-to-tests`
- Restart Claude Code session (close and reopen)

### "Tests failing after code generation?"
- Agent 2 may have misunderstood the test contract
- Add clarifying comments in test files
- Use plan mode to review the generation before accepting

### "Context window filling up?"
- Run `/compact` before large work
- Simplify feature specs - focus on one concern per feature
- Commit frequently to reset conversation history

### "Agent generating too much code?"
- Add to the plan: "keep implementation minimal, only pass the tests"
- Break features into smaller specs
- Review the feature requirements - they may be too broad

## Best Practices for Workshop Success

1. **Test-First Always**: Never write code without tests first. Tests define the contract.

2. **One Feature at a Time**: Complete a feature end-to-end (tests + code + commit) before starting the next.

3. **Review Diffs Carefully**: Even when confident, review the first few diffs from Agent 2. Catch misunderstandings early.

4. **Clear Feature Specs**: Spend time on the feature specification. Better specs → better tests → better code.

5. **Keep Tests Small**: One test file per feature module. Makes refactoring safer.

6. **Commit Between Phases**: Commit tests before code. Makes it easy to see the contract.

7. **Edge Cases Matter**: Include edge cases in feature specs. They prevent bugs later.

## Integration with Your Development Process

### With Git
- Tests are the first commit in a feature branch
- Code implementation is the second commit
- This preserves the TDD discipline in history

### With CI/CD
Add to your CI pipeline:
```bash
npm test
```

All tests must pass before merging.

### With Code Review
- Reviewers see test files first (the contract)
- Then code (the implementation)
- This guides review and ensures tests actually specify behavior

## Learning Resources

- **CLAUDE.md**: Workflow and conventions
- **FEATURE_TEMPLATE.md**: How to write good feature specs
- **Tests Generated**: Study the patterns Claude uses for your framework
- **Code Generated**: See how Claude implements from test specs

## Next Steps

1. Run `./scripts/init-tdd-repo.sh` to set up
2. Open `code .` to start VS Code
3. Try the example feature to learn the workflow
4. Create your first real feature using FEATURE_TEMPLATE.md
5. Iterate: feature spec → tests → code → commit

## Support

If Claude Code isn't behaving as expected:
- Check [CLAUDE.md](./CLAUDE.md) for workflow clarification
- Review test files to understand what behavior is expected
- Use plan mode to see what Claude intends before implementing
- Simplify feature specs if agents seem confused

---

**Happy TDD coding!** 🚀
