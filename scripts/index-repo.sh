#!/bin/bash
# update-index.sh - Update .claude/index.md with current repo state

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDEX_FILE="$REPO_ROOT/.claude/index.md"

echo "📑 Updating .claude/index.md..."

# Count files
FEATURE_COUNT=$(find "$REPO_ROOT/features" -name "*.md" 2>/dev/null | wc -l)
TEST_COUNT=$(find "$REPO_ROOT/tests" -name "test-*.ts" -o -name "test-*.py" 2>/dev/null | wc -l)
CODE_COUNT=$(find "$REPO_ROOT/src" -name "*.t   s" -o -name "*.py" 2>/dev/null | wc -l)

echo "✓ Found $FEATURE_COUNT features"
echo "✓ Found $TEST_COUNT test files"
echo "✓ Found $CODE_COUNT code files"

# Extract last updated timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Update the index file (update the stats section)
sed -i.bak "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $TIMESTAMP/" "$INDEX_FILE" 2>/dev/null || \
sed -i "" "s/\*\*Last Updated:\*\* .*/\*\*Last Updated:\*\* $TIMESTAMP/" "$INDEX_FILE"

# Update stats
sed -i.bak "s/\*\*Total Features\*\*: .*/\*\*Total Features\*\*: $FEATURE_COUNT/" "$INDEX_FILE" 2>/dev/null || \
sed -i "" "s/\*\*Total Features\*\*: .*/\*\*Total Features\*\*: $FEATURE_COUNT/" "$INDEX_FILE"

sed -i.bak "s/\*\*Test Files\*\*: .*/\*\*Test Files\*\*: $TEST_COUNT/" "$INDEX_FILE" 2>/dev/null || \
sed -i "" "s/\*\*Test Files\*\*: .*/\*\*Test Files\*\*: $TEST_COUNT/" "$INDEX_FILE"

sed -i.bak "s/\*\*Code Files\*\*: .*/\*\*Code Files\*\*: $CODE_COUNT/" "$INDEX_FILE" 2>/dev/null || \
sed -i "" "s/\*\*Code Files\*\*: .*/\*\*Code Files\*\*: $CODE_COUNT/" "$INDEX_FILE"

# Clean up backup files
rm -f "$INDEX_FILE.bak"

echo ""
echo "✅ Index updated successfully!"
echo ""
echo "Summary:"
echo "  Features:   $FEATURE_COUNT"
echo "  Tests:      $TEST_COUNT"
echo "  Code:       $CODE_COUNT"
echo "  Updated:    $TIMESTAMP"
echo ""
echo "Now commit the changes:"
echo "  git add .claude/index.md"
echo "  git commit -m 'docs: update repository index'"