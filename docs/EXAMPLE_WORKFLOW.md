# TDD Workflow Example - Complete End-to-End

This document walks through a real example of the two-agent workflow: generating tests, then code.

## Feature: Email Validator

### Step 1: Write Feature Specification

**File: `features/email-validation.md`**

```markdown
# Feature: Email Validation Utility

## Summary

Validate email addresses according to RFC 5322 basic rules.

## User Story
```

As a developer
I want a reliable email validator
So that user inputs are validated before storage

````

## Requirements
- [ ] Accept valid email addresses
- [ ] Reject emails without @ symbol
- [ ] Reject emails with multiple @ symbols
- [ ] Reject emails with no domain
- [ ] Reject emails with no local part
- [ ] Handle whitespace (trim before validating)

## Acceptance Criteria
```gherkin
Given a valid email "user@example.com"
When validated
Then returns true

Given an invalid email "invalid.email"
When validated
Then returns false

Given an email with spaces " user@example.com "
When validated
Then returns true (after trimming)

Given an email with multiple @ "user@@example.com"
When validated
Then returns false
````

## Edge Cases

- What if the input is null or undefined?
- What if the domain has no TLD? (user@localhost)
- What if local part has special chars? (user+tag@example.com)

## Technical Details

- **Language**: JavaScript
- **Module**: `src/email-validator.js`
- **Function**: `isValidEmail(email)` → boolean
- **Framework**: Vitest for testing

## Example Usage

```javascript
const { isValidEmail } = require("../src/email-validator");

console.log(isValidEmail("john@example.com")); // true
console.log(isValidEmail("invalid.email")); // false
console.log(isValidEmail(" jane@test.org ")); // true
console.log(isValidEmail("user@@domain.com")); // false
```

```

### Step 2: Generate Tests (Agent 1)

**You type in Claude Code:**
```

/tdd-feature-to-tests email-validation

````

**Agent 1 generates: `tests/test-email-validator.js`**

```javascript
/**
 * Tests for Email Validation
 *
 * Feature: Email Validator
 * Requirements tested:
 * - Valid email acceptance
 * - @ symbol requirement
 * - Single @ requirement
 * - Domain requirement
 * - Local part requirement
 * - Whitespace handling
 */

const { isValidEmail } = require('../src/email-validator');

describe('Email Validator', () => {

  describe('Valid emails', () => {

    test('accepts standard email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    test('accepts email with subdomain', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
    });

    test('accepts email with numbers', () => {
      expect(isValidEmail('user123@example456.com')).toBe(true);
    });

    test('accepts email with dots in local part', () => {
      expect(isValidEmail('first.last@example.com')).toBe(true);
    });

    test('accepts email with plus addressing', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    test('accepts email with dash in domain', () => {
      expect(isValidEmail('user@example-domain.com')).toBe(true);
    });
  });

  describe('Invalid emails', () => {

    test('rejects email without @ symbol', () => {
      expect(isValidEmail('invalidemail.com')).toBe(false);
    });

    test('rejects email with multiple @ symbols', () => {
      expect(isValidEmail('user@@example.com')).toBe(false);
    });

    test('rejects email with three @ symbols', () => {
      expect(isValidEmail('user@exam@ple@.com')).toBe(false);
    });

    test('rejects email with no domain', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    test('rejects email with no local part', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    test('rejects email with space in middle', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    test('rejects empty string', () => {
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('Whitespace handling', () => {

    test('accepts email with leading space after trim', () => {
      expect(isValidEmail(' user@example.com')).toBe(true);
    });

    test('accepts email with trailing space after trim', () => {
      expect(isValidEmail('user@example.com ')).toBe(true);
    });

    test('accepts email with both leading and trailing spaces', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });

    test('accepts email with tab characters', () => {
      expect(isValidEmail('\tuser@example.com\t')).toBe(true);
    });
  });

  describe('Edge cases', () => {

    test('handles null input', () => {
      expect(isValidEmail(null)).toBe(false);
    });

    test('handles undefined input', () => {
      expect(isValidEmail(undefined)).toBe(false);
    });

    test('handles non-string input', () => {
      expect(isValidEmail(123)).toBe(false);
    });

    test('rejects single character local part with no domain', () => {
      expect(isValidEmail('a@')).toBe(false);
    });

    test('rejects domain without TLD', () => {
      expect(isValidEmail('user@localhost')).toBe(false);
    });

    test('rejects email starting with dot', () => {
      expect(isValidEmail('.user@example.com')).toBe(false);
    });

    test('rejects email ending with dot', () => {
      expect(isValidEmail('user.@example.com')).toBe(false);
    });
  });
});
````

**You review the tests:**

- ✓ 20 tests covering all requirements
- ✓ Organized into logical groups
- ✓ Clear test descriptions
- ✓ Tests validate both happy and sad paths

**You commit:**

```bash
git add tests/test-email-validator.js
git commit -m "test: add email validator tests"
```

### Step 3: Generate Implementation (Agent 2)

**You type in Claude Code:**

```
/tdd-tests-to-code test-email-validator.js
```

**Agent 2 generates: `src/email-validator.js`**

```javascript
/**
 * Email Validator
 *
 * Validates email addresses according to basic RFC 5322 rules.
 */

/**
 * Validates if a string is a valid email address
 * @param {any} email - The email to validate
 * @returns {boolean} - True if valid email format, false otherwise
 */
function isValidEmail(email) {
  // Handle null, undefined, and non-string inputs
  if (email === null || email === undefined || typeof email !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check if empty after trimming
  if (trimmedEmail.length === 0) {
    return false;
  }

  // Check for exactly one @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return false;
  }

  // Split into local and domain parts
  const [localPart, domain] = trimmedEmail.split("@");

  // Validate local part exists and doesn't start/end with dot
  if (!localPart || localPart.length === 0) {
    return false;
  }
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return false;
  }

  // Validate domain exists and has a TLD (contains at least one dot)
  if (!domain || domain.length === 0) {
    return false;
  }
  if (!domain.includes(".")) {
    return false;
  }

  // Domain should not start or end with dot or dash
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }
  if (domain.startsWith("-") || domain.endsWith("-")) {
    return false;
  }

  // Basic check: domain should have valid structure
  const parts = domain.split(".");
  for (const part of parts) {
    if (part.length === 0) {
      return false;
    }
  }

  return true;
}

module.exports = {
  isValidEmail,
};
```

**You review the implementation:**

- ✓ Handles all test cases
- ✓ Clean, readable code
- ✓ Good comments
- ✓ Proper error handling

**You run tests:**

```bash
npm test test-email-validator.js
```

Output:

```
 PASS  tests/test-email-validator.js
  Email Validator
    Valid emails
      ✓ accepts standard email (2ms)
      ✓ accepts email with subdomain (1ms)
      ✓ accepts email with numbers (1ms)
      ✓ accepts email with dots in local part (1ms)
      ✓ accepts email with plus addressing (1ms)
      ✓ accepts email with dash in domain (1ms)
    Invalid emails
      ✓ rejects email without @ symbol (1ms)
      ✓ rejects email with multiple @ symbols (1ms)
      ✓ rejects email with three @ symbols (1ms)
      ✓ rejects email with no domain (1ms)
      ✓ rejects email with no local part (1ms)
      ✓ rejects email with space in middle (1ms)
      ✓ rejects empty string (1ms)
    Whitespace handling
      ✓ accepts email with leading space after trim (1ms)
      ✓ accepts email with trailing space after trim (1ms)
      ✓ accepts email with both leading and trailing spaces (1ms)
      ✓ accepts email with tab characters (1ms)
    Edge cases
      ✓ handles null input (1ms)
      ✓ handles undefined input (1ms)
      ✓ handles non-string input (1ms)
      ✓ rejects single character local part with no domain (1ms)
      ✓ rejects domain without TLD (1ms)
      ✓ rejects email starting with dot (1ms)
      ✓ rejects email ending with dot (1ms)

Test Suites: 1 passed, 1 total
Tests:       21 passed, 21 total
Time:        1.234s
```

**All tests pass! You commit:**

```bash
git add src/email-validator.js
git commit -m "feat: implement email validator"
```

## Summary: Two Commits, Clear Intent

```bash
$ git log --oneline
a1b2c3d feat: implement email validator          ← Code
9f8e7d6 test: add email validator tests          ← Tests
5k4j3h2 Initial project setup
```

The git history shows:

1. **First commit**: Test contract (what behavior is expected)
2. **Second commit**: Implementation (how to achieve it)

This preserves the TDD discipline and makes code review clearer.

## Key Takeaways

1. **Feature Spec** → Clear requirements and examples
2. **Agent 1** → Comprehensive tests from requirements
3. **You review** → Ensure tests match intent
4. **You commit** → Lock in the test contract
5. **Agent 2** → Implementation to pass all tests
6. **You review** → Check code quality and coverage
7. **You commit** → Record the solution

The tests define "what", the code defines "how".

---

This workflow prevents:

- ❌ Incomplete implementations (tests verify)
- ❌ Over-engineering (minimal code to pass)
- ❌ Unclear requirements (feature spec clarifies)
- ❌ Scope creep (tests lock down expectations)
- ❌ Regressions (tests prevent breakage)
