# Feature: Health Endpoint

## Summary
A `GET /api/health` endpoint that reports server liveness, uptime, and runtime metadata for consumption by load balancers, monitoring tools, and Kubernetes probes.

## User Story
```
As an operator (load balancer, Kubernetes, Datadog, CI pipeline, or developer)
I want to query GET /api/health
So that I can determine whether the server is healthy and get runtime metadata without side effects
```

## Requirements
- [ ] Respond to `GET /api/health`
- [ ] Return HTTP 200 with JSON body when the server is healthy
- [ ] Return HTTP 503 with JSON body when the server is degraded
- [ ] Include `status` field: `"ok"` or `"degraded"`
- [ ] Include `uptime` as both seconds (number) and human-readable string (e.g. `"2d 4h 12m 5s"`)
- [ ] Include `version` from `package.json`
- [ ] Include `environment` from `NODE_ENV` (default: `"development"`)
- [ ] Include `nodeVersion` from `process.version`

## Acceptance Criteria

```gherkin
Scenario: Healthy server — HTTP status
  Given the server is running normally
  When a client sends GET /api/health
  Then the response status is 200

Scenario: Healthy server — response body fields
  Given the server is running normally
  When a client sends GET /api/health
  Then the body matches:
    | field              | expected                        |
    | status             | "ok"                            |
    | uptime.seconds     | a positive number               |
    | uptime.human       | a non-empty string              |
    | version            | matches package.json version    |
    | environment        | matches NODE_ENV                |
    | nodeVersion        | matches process.version         |

Scenario: Degraded server — HTTP status
  Given the server is in a degraded state
  When a client sends GET /api/health
  Then the response status is 503

Scenario: Degraded server — response body
  Given the server is in a degraded state
  When a client sends GET /api/health
  Then status is "degraded"
  Then uptime, version, environment, and nodeVersion are still present

Scenario: Missing NODE_ENV
  Given NODE_ENV is not set
  When a client sends GET /api/health
  Then the environment field is "development"

Scenario: Zero uptime
  Given the server has just started (uptime < 1 second)
  When a client sends GET /api/health
  Then uptime.seconds is 0
  Then uptime.human is "0s"
```

## Edge Cases
- `NODE_ENV` not set → default to `"development"`
- Uptime less than 60s → show only seconds, e.g. `"45s"`
- Uptime on exact boundary (60s, 3600s) → omit zero units, e.g. `"1m"` not `"1m 0s"`
- `package.json` version missing → fall back to `"unknown"`
- Endpoint must not mutate state — pure read, no required logging side effects

## Technical Details
- **Language/Framework**: TypeScript + Hono
- **Module name**: `src/health.ts` (handler) + `src/utils/uptime.ts` (uptime formatter)
- **Related Modules**: `package.json` (version), `process.env.NODE_ENV`, `process.uptime()`
- **Dependencies**: `hono` (already installed)
- **Response shape**:
```ts
{
  status: "ok" | "degraded";
  uptime: {
    seconds: number;
    human: string;       // e.g. "2d 4h 12m 5s"
  };
  version: string;       // e.g. "1.0.0"
  environment: string;   // e.g. "production"
  nodeVersion: string;   // e.g. "v20.11.0"
}
```

## Example Usage
```ts
// GET /api/health → 200
{
  "status": "ok",
  "uptime": { "seconds": 93725, "human": "1d 2h 2m 5s" },
  "version": "1.0.0",
  "environment": "production",
  "nodeVersion": "v20.11.0"
}

// GET /api/health → 503 (degraded)
{
  "status": "degraded",
  "uptime": { "seconds": 12, "human": "12s" },
  "version": "1.0.0",
  "environment": "staging",
  "nodeVersion": "v20.11.0"
}
```

## Success Criteria
When all tests pass for this feature:
- ✓ 200 returned for healthy server
- ✓ 503 returned for degraded server
- ✓ All required fields present in both cases
- ✓ Uptime human-readable format handles all time boundaries correctly
- ✓ NODE_ENV default works
- ✓ Version falls back gracefully

## Notes
- The handler does not determine degraded state directly — a `isHealthy()` function is injected so the handler remains unit-testable
- Uptime formatting lives in its own utility (`src/utils/uptime.ts`) for isolated unit testing
