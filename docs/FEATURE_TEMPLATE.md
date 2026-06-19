# Feature Template

Use this template to define features that Agent 1 will convert to tests.

---

# Feature: [Feature Name]

## Summary
[One sentence describing what this feature does]

## User Story
```
As a [role/user]
I want to [action]
So that [benefit]
```

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria
```gherkin
Given [initial state]
When [user action]
Then [expected outcome]

Given [initial state]
When [user action]
Then [expected outcome]
```

## Edge Cases
- What if [condition]?
- What if [condition]?
- Handle [error scenario]

## Technical Details
- **Language/Framework**: JavaScript/TypeScript (or your choice)
- **Related Modules**: List existing code this feature interacts with
- **Dependencies**: External libraries needed
- **Data Structures**: Any specific format expected

## Example Usage
```javascript
// How the feature should be used
const result = someFunction(input);
console.log(result); // expected output
```

## Success Criteria
When all tests pass for this feature:
- ✓ All acceptance criteria verified
- ✓ Edge cases handled
- ✓ Error messages are user-friendly
- ✓ Code is testable and modular

## Notes
[Any additional context for the agent]

---

## Example: User Authentication

# Feature: User Login

## Summary
Users can log in with email and password, and receive a session token.

## User Story
```
As a user
I want to log in with my credentials
So that I can access my account
```

## Requirements
- [ ] Accept email and password
- [ ] Validate email format
- [ ] Validate password length (minimum 8 characters)
- [ ] Hash passwords before storage
- [ ] Return session token on success
- [ ] Reject invalid credentials
- [ ] Lock account after 5 failed attempts

## Acceptance Criteria
```gherkin
Given a registered user
When they submit correct email and password
Then they receive a valid session token

Given a registered user
When they submit incorrect password
Then login fails with "Invalid credentials"

Given a user with 5 failed attempts
When they try to log in again
Then the account is locked
```

## Edge Cases
- What if email doesn't exist?
- What if password is empty?
- What if user tries to login while already logged in?
- What if session token expires?

## Technical Details
- **Language/Framework**: Node.js + Express
- **Related Modules**: `user-service.js`, `auth-token-service.js`
- **Dependencies**: `bcryptjs`, `jsonwebtoken`
- **Data Structures**: `{ email, password }` → `{ token, expiresIn }`

## Example Usage
```javascript
const auth = new AuthService();
const result = await auth.login('user@example.com', 'password123');
// { token: 'jwt...', expiresIn: 3600 }
```

## Success Criteria
When all tests pass:
- ✓ Valid login produces token
- ✓ Invalid credentials rejected
- ✓ Account locking works
- ✓ Error messages clear
- ✓ Tests cover all 7 requirements
