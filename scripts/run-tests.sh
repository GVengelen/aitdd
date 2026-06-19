#!/bin/bash
# run-tests.sh - Run tests and report results

set -e

TESTS_DIR="tests"
SRC_DIR="src"
COVERAGE_DIR="coverage"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 TDD Workshop Test Runner${NC}"
echo "================================"

# Check what test framework is available
if [ -f "package.json" ]; then
    if grep -q '"vitest"' package.json; then
        TEST_FRAMEWORK="vitest"
    elif grep -q '"mocha"' package.json; then
        TEST_FRAMEWORK="mocha"
    fi
fi

if [ -f "requirements.txt" ]; then
    TEST_FRAMEWORK="pytest"
fi

if [ -z "$TEST_FRAMEWORK" ]; then
    echo -e "${RED}❌ No test framework detected${NC}"
    echo "Supported: Vitest, Mocha (JavaScript) or pytest (Python)"
    exit 1
fi

echo -e "${YELLOW}Using: $TEST_FRAMEWORK${NC}"
echo ""

# Run tests based on framework
case $TEST_FRAMEWORK in
    vitest)
        npm test
        ;;
    mocha)
        npm test
        ;;
    pytest)
        python -m pytest tests/ -v
        ;;
esac

EXIT_CODE=$?

# Summary
echo ""
echo "================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
fi

echo ""
echo "📊 Next Steps:"
echo "  • If tests passed, run: claude /tdd-tests-to-code <test-file>"
echo "  • If tests failed, fix the tests and try again"
echo "  • Review: $(find tests -name '*.ts' -o -name '*.js' -o -name '*.py' | wc -l) test file(s)"

exit $EXIT_CODE
