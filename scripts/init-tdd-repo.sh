#!/bin/bash
# init-tdd-repo.sh - Initialize TDD workshop repository

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════╗"
echo "║   TDD Workshop Setup Script     ║"
echo "╚════════════════════════════════╝"
echo -e "${NC}"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} detected${NC}"
else
    echo -e "${YELLOW}⚠ Node.js not found. Some features may not work.${NC}"
fi

# Check Claude Code CLI
if command -v claude &> /dev/null; then
    CLAUDE_VERSION=$(claude --version)
    echo -e "${GREEN}✓ Claude Code ${CLAUDE_VERSION} installed${NC}"
else
    echo -e "${YELLOW}⚠ Claude Code CLI not found.${NC}"
    echo "  Install with: npm install -g @anthropic-ai/claude-code"
fi

echo ""
echo -e "${YELLOW}Setting up directories...${NC}"

# Create directory structure
mkdir -p features
mkdir -p tests/{unit,integration}
mkdir -p src
mkdir -p scripts
mkdir -p .vscode
mkdir -p .claude

echo -e "${GREEN}✓ Created directory structure${NC}"

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    echo ""
    echo -e "${YELLOW}Creating package.json...${NC}"
    cat > package.json << 'EOF'
{
  "name": "tdd-workshop",
  "version": "1.0.0",
  "description": "Test-Driven Development Workshop with Claude Code Agents",
  "type": "module",
  "scripts": {
    "test": "vitest run --passWithNoTests",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^4.0.0",
    "@vitest/coverage-v8": "^4.0.0"
  }
}
EOF
    echo -e "${GREEN}✓ Created package.json${NC}"
    
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Create a sample feature
if [ ! -f "features/example-feature.md" ]; then
    echo ""
    echo -e "${YELLOW}Creating example feature...${NC}"
    cat > features/example-feature.md << 'EOF'
# Feature: String Reversal Utility

## Summary
A simple utility function that reverses strings, demonstrating the TDD workflow.

## User Story
```
As a developer
I want a reliable string reversal function
So that I can reverse text in my application
```

## Requirements
- [ ] Reverse a normal string
- [ ] Handle empty strings
- [ ] Handle single character
- [ ] Handle special characters
- [ ] Handle Unicode characters

## Acceptance Criteria
```gherkin
Given a string "hello"
When reversed
Then returns "olleh"

Given an empty string ""
When reversed
Then returns ""

Given a string with special chars "a!b@c"
When reversed
Then returns "c@b!a"
```

## Technical Details
- **Language**: JavaScript
- **Module**: `src/string-utils.js`
- **Function name**: `reverseString(str)`

## Example Usage
```javascript
import { reverseString } from '../src/string-utils.js';

console.log(reverseString("hello")); // "olleh"
console.log(reverseString(""));      // ""
```
EOF
    echo -e "${GREEN}✓ Created example feature${NC}"
fi

# Create VS Code settings
cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/.git": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true
  }
}
EOF
echo -e "${GREEN}✓ Created VS Code settings${NC}"

# Create .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Testing
coverage/
.nyc_output/

# Build
dist/
build/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.local
.env.*.local

# Claude
.claude/credentials.json
EOF
    echo -e "${GREEN}✓ Created .gitignore${NC}"
fi

echo ""
echo -e "${BLUE}════════════════════════════════${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════${NC}"

echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the example feature:"
echo "   cat features/example-feature.md"
echo ""
echo "2. Generate tests using Claude Code:"
echo "   • Open VS Code: code ."
echo "   • Click the Spark icon in the top right"
echo "   • Type: /tdd-feature-to-tests example-feature"
echo ""
echo "3. Review generated tests:"
echo "   ls tests/"
echo ""
echo "4. Generate implementation code:"
echo "   • In Claude Code: /tdd-tests-to-code test-string-utils.js"
echo ""
echo "5. Run tests to verify:"
echo "   npm test"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo "  • Read CLAUDE.md for workflow details"
echo "  • Read FEATURE_TEMPLATE.md to create new features"
echo ""
