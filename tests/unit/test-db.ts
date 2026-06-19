import { getDatabaseUrl } from '../../src/lib/db';

describe('getDatabaseUrl', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalEnv;
    }
  });

  test('returns DATABASE_URL when set', () => {
    process.env.DATABASE_URL = 'file:./custom.db';
    expect(getDatabaseUrl()).toBe('file:./custom.db');
  });

  test('falls back to "file:./dev.db" when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;
    expect(getDatabaseUrl()).toBe('file:./dev.db');
  });
});
