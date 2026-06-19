import { app } from '../../src/app';
import pkg from '../../package.json';

type HealthBody = {
  status: 'ok' | 'degraded';
  uptime: { seconds: number; human: string };
  version: string;
  environment: string;
  nodeVersion: string;
};

describe('GET /api/health — integration', () => {
  let res: Response;
  let body: HealthBody;

  beforeAll(async () => {
    res = await app.request('/api/health');
    body = (await res.json()) as HealthBody;
  });

  test('returns HTTP 200', () => {
    expect(res.status).toBe(200);
  });

  test('status is "ok"', () => {
    expect(body.status).toBe('ok');
  });

  test('version matches package.json', () => {
    expect(body.version).toBe(pkg.version);
  });

  test('nodeVersion matches process.version', () => {
    expect(body.nodeVersion).toBe(process.version);
  });

  test('environment is a non-empty string', () => {
    expect(body.environment.length).toBeGreaterThan(0);
  });

  test('uptime.seconds is a non-negative number', () => {
    expect(body.uptime.seconds).toBeGreaterThanOrEqual(0);
  });

  test('uptime.human is a non-empty string', () => {
    expect(body.uptime.human.length).toBeGreaterThan(0);
  });

  test('uptime.seconds is an integer', () => {
    expect(Number.isInteger(body.uptime.seconds)).toBe(true);
  });

  test('response Content-Type is application/json', () => {
    expect(res.headers.get('content-type')).toContain('application/json');
  });
});
