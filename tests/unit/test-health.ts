import { Hono } from 'hono';
import { createHealthHandler, HealthDeps } from '../../src/health';
import pkg from '../../package.json';

type HealthBody = {
  status: 'ok' | 'degraded';
  uptime: { seconds: number; human: string };
  version: string;
  environment: string;
  nodeVersion: string;
};

function buildApp(deps: Partial<HealthDeps> = {}) {
  const app = new Hono();
  app.get('/api/health', createHealthHandler(deps));
  return app;
}

// ─── Healthy server ───────────────────────────────────────────────────────────

describe('GET /api/health — healthy server', () => {
  let res: Response;
  let body: HealthBody;

  beforeEach(async () => {
    const app = buildApp({ isHealthy: () => true, getUptime: () => 93725 });
    res = await app.request('/api/health');
    body = (await res.json()) as HealthBody;
  });

  test('returns HTTP 200', () => {
    expect(res.status).toBe(200);
  });

  test('status is "ok"', () => {
    expect(body.status).toBe('ok');
  });

  test('uptime.seconds is a number', () => {
    expect(typeof body.uptime.seconds).toBe('number');
  });

  test('uptime.seconds reflects injected getUptime value', () => {
    expect(body.uptime.seconds).toBe(93725);
  });

  test('uptime.human is a non-empty string', () => {
    expect(body.uptime.human.length).toBeGreaterThan(0);
  });

  test('version matches package.json', () => {
    expect(body.version).toBe(pkg.version);
  });

  test('nodeVersion matches process.version', () => {
    expect(body.nodeVersion).toBe(process.version);
  });
});

// ─── Degraded server ──────────────────────────────────────────────────────────

describe('GET /api/health — degraded server', () => {
  let res: Response;
  let body: HealthBody;

  beforeEach(async () => {
    const app = buildApp({ isHealthy: () => false, getUptime: () => 12 });
    res = await app.request('/api/health');
    body = (await res.json()) as HealthBody;
  });

  test('returns HTTP 503', () => {
    expect(res.status).toBe(503);
  });

  test('status is "degraded"', () => {
    expect(body.status).toBe('degraded');
  });

  test('uptime field is still present', () => {
    expect(body.uptime).toBeDefined();
  });

  test('version field is still present', () => {
    expect(body.version).toBeDefined();
  });

  test('environment field is still present', () => {
    expect(body.environment).toBeDefined();
  });

  test('nodeVersion field is still present', () => {
    expect(body.nodeVersion).toBeDefined();
  });
});

// ─── environment field ────────────────────────────────────────────────────────

describe('GET /api/health — environment field', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('defaults to "development" when NODE_ENV is not set', async () => {
    delete process.env.NODE_ENV;
    const app = buildApp({ isHealthy: () => true });
    const res = await app.request('/api/health');
    const body = (await res.json()) as HealthBody;
    expect(body.environment).toBe('development');
  });

  test('reflects NODE_ENV = "production"', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildApp({ isHealthy: () => true });
    const res = await app.request('/api/health');
    const body = (await res.json()) as HealthBody;
    expect(body.environment).toBe('production');
  });

  test('reflects NODE_ENV = "staging"', async () => {
    process.env.NODE_ENV = 'staging';
    const app = buildApp({ isHealthy: () => true });
    const res = await app.request('/api/health');
    const body = (await res.json()) as HealthBody;
    expect(body.environment).toBe('staging');
  });
});

// ─── Zero uptime ──────────────────────────────────────────────────────────────

describe('GET /api/health — zero uptime', () => {
  let body: HealthBody;

  beforeEach(async () => {
    const app = buildApp({ isHealthy: () => true, getUptime: () => 0 });
    const res = await app.request('/api/health');
    body = (await res.json()) as HealthBody;
  });

  test('uptime.seconds is 0', () => {
    expect(body.uptime.seconds).toBe(0);
  });

  test('uptime.human is "0s"', () => {
    expect(body.uptime.human).toBe('0s');
  });
});

// ─── Version fallback ─────────────────────────────────────────────────────────

describe('GET /api/health — version fallback', () => {
  test('version is "unknown" when getVersion returns undefined', async () => {
    const app = buildApp({ isHealthy: () => true, getVersion: () => undefined });
    const res = await app.request('/api/health');
    const body = (await res.json()) as HealthBody;
    expect(body.version).toBe('unknown');
  });
});
