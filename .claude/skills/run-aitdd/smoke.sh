#!/usr/bin/env bash
# Smoke-tests the running aitdd API server.
# Usage: PORT=3000 bash .claude/skills/run-aitdd/smoke.sh
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:$PORT"
PASS=0; FAIL=0

check() {
  local label="$1" expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS  $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  $label (expected to contain: $expected)"
    echo "        got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "==> Smoke-testing $BASE"

# 1. Health
R=$(curl -sf "$BASE/api/health")
check "GET /api/health → status ok"      '"status":"ok"'  "$R"
check "GET /api/health → version field"  '"version"'      "$R"

# 2. List users (may be empty)
R=$(curl -sf "$BASE/api/users")
check "GET /api/users → JSON array" '\[' "$R"

# 3. Create user
EMAIL="smoke-$$@example.com"
R=$(curl -sf -X POST "$BASE/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smoke Test\",\"email\":\"$EMAIL\"}")
check "POST /api/users → 201 body has id"    '"id"'    "$R"
check "POST /api/users → email echoed back"  "$EMAIL"  "$R"
ID=$(echo "$R" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# 4. Get by id
R=$(curl -sf "$BASE/api/users/$ID")
check "GET /api/users/:id → correct user" "$EMAIL" "$R"

# 5. Update
R=$(curl -sf -X PUT "$BASE/api/users/$ID" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}')
check "PUT /api/users/:id → name updated" '"Updated Name"' "$R"

# 6. Duplicate email → 409
R=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Dup\",\"email\":\"$EMAIL\"}")
check "POST /api/users duplicate → 409" "409" "$R"

# 7. Not found → 404
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/users/nonexistent-id")
check "GET /api/users/:id not-found → 404" "404" "$R"

# 8. Delete
curl -sf -X DELETE "$BASE/api/users/$ID" -o /dev/null
R=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/users/$ID")
check "DELETE /api/users/:id then GET → 404" "404" "$R"

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
