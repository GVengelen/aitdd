---
model: claude-sonnet-4-6
tools:
  - Read
  - Write
---

Create a well-structured feature specification file interactively.

1. Ask clarifying questions about the feature (in a conversational way):

   - What does this feature do in simple terms?
   - Who are the users/roles that interact with it?
   - What problem does it solve or value does it provide?
   - What are 4-6 core requirements? (Ask for specifics)
   - What should fail gracefully? What are edge cases?
   - Are there dependencies or integrations? (Database, APIs, etc.)
   - Check schema's and ask question in regards to migrations

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
