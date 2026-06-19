---
name: run-aitdd
description: Run, start, build, test, screenshot, smoke-test the aitdd Hono REST API server. Use to launch the server, verify endpoints, or confirm a change works in the running app.
---

# run-aitdd

A Hono REST API server (TypeScript / Node.js) backed by SQLite via Prisma. Exposes `/api/health` and `/api/users` CRUD. Driven by curl via `smoke.sh`.

## Prerequisites

- Node.js ≥ 18 (`node --version`)
- Dependencies installed: `npm install`

## Build

```bash
npm run build   # tsc → dist/
```

## Run (agent path)

Start the server in the background, run the smoke script, then stop:

```bash
PORT=3099 npm run dev &
SERVER_PID=$!
sleep 3
PORT=3099 bash .claude/skills/run-aitdd/smoke.sh
kill $SERVER_PID
```

The smoke script:

- checks `GET /api/health`
- lists users
- creates, reads, updates, and deletes a user
- asserts 409 on duplicate email and 404 on missing id
- exits non-zero if any check fails

To test a single endpoint interactively while the server is running:

```bash
curl -s http://localhost:3099/api/health | python3 -m json.tool
curl -s http://localhost:3099/api/users  | python3 -m json.tool
```

## Run (human path)

```bash
npm run dev   # starts on port 3000, hot-reloads via tsx
```

Open `http://localhost:3000/api/health` in a browser. Ctrl-C to stop.

## Tests

```bash
npm test                  # Vitest unit + integration tests
npm run test:coverage     # with coverage report
```

## Gotchas

- **Prisma auto-migrates on start.** `src/index.ts` runs `npx prisma migrate deploy` before binding. First start on a fresh `dev.db` applies all migrations; subsequent starts are instant.
- **User IDs are cuid strings**, not integers. `GET /api/users/1` returns 404 — use the id from the create response.
- **Port default is 3000.** Set `PORT=<n>` to avoid conflicts if 3000 is in use.
- **`npm run dev` never exits.** Always background it (`&`) and capture the PID so you can `kill $SERVER_PID` when done.
- **Duplicate email returns 409**, not 400 — the error body has an `"error"` key.
