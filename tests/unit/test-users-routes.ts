// Routes are tested via Hono's app.request() — no real HTTP server needed.
// The service is injected so the route layer can be tested in isolation.
import type { Mocked } from 'vitest';
import { Hono } from 'hono';
import { createUsersRouter } from '../../src/modules/users/users.routes';
import { NotFoundError, DuplicateEmailError } from '../../src/lib/errors';
import type { UsersService } from '../../src/modules/users/users.service';

function makeMockService(): Mocked<UsersService> {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function buildApp(service: Mocked<UsersService>) {
  const app = new Hono();
  app.route('/users', createUsersRouter(service));
  return app;
}

type UserBody = { id: string; name: string; email: string; createdAt: string };

const ALICE: UserBody = {
  id: '1',
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── POST /users ──────────────────────────────────────────────────────────────

describe('POST /users — create user', () => {
  test('returns 201 on valid input', async () => {
    const service = makeMockService();
    service.create.mockResolvedValue(ALICE);

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    expect(res.status).toBe(201);
  });

  test('response body contains the created user', async () => {
    const service = makeMockService();
    service.create.mockResolvedValue(ALICE);

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    expect(await res.json()).toMatchObject({ id: '1', name: 'Alice', email: 'alice@example.com' });
  });

  test('passes validated input to service.create', async () => {
    const service = makeMockService();
    service.create.mockResolvedValue(ALICE);

    await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    expect(service.create).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
  });

  test('returns 400 (not 500) when request body is not valid JSON', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json at all',
    });

    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    // catch(() => ({})) gives field-level errors; catch(() => undefined) would give "expected object"
    expect(body.error).not.toContain('expected object');
  });

  test('returns 400 when email is missing', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice' }),
    });

    expect(res.status).toBe(400);
  });

  test('returns 400 when email format is invalid', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'not-an-email' }),
    });

    expect(res.status).toBe(400);
  });

  test('returns 400 when name is missing', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com' }),
    });

    expect(res.status).toBe(400);
  });

  test('returns 400 when name is an empty string', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'alice@example.com' }),
    });

    expect(res.status).toBe(400);
  });

  test('does not call service.create when validation fails', async () => {
    const service = makeMockService();

    await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'bad-email' }),
    });

    expect(service.create).not.toHaveBeenCalled();
  });

  test('400 response body contains structured error details', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'bad' }),
    });
    const body = await res.json() as Record<string, unknown>;

    expect(body.error).toBeDefined();
  });

  test('returns 409 when service throws DuplicateEmailError', async () => {
    const service = makeMockService();
    service.create.mockRejectedValue(new DuplicateEmailError('alice@example.com'));

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    expect(res.status).toBe(409);
  });

  test('409 response body contains an error message', async () => {
    const service = makeMockService();
    service.create.mockRejectedValue(new DuplicateEmailError('alice@example.com'));

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    const body = await res.json() as { error: string };

    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });

  test('returns 500 when service throws an unexpected error', async () => {
    const service = makeMockService();
    service.create.mockRejectedValue(new Error('unexpected failure'));

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    expect(res.status).toBe(500);
  });

  test('500 response does not leak internal error details', async () => {
    const service = makeMockService();
    service.create.mockRejectedValue(new Error('secret internal error'));

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    const text = await res.text();

    expect(text).not.toContain('secret internal error');
  });

  test('500 response body has error field with "Internal server error"', async () => {
    const service = makeMockService();
    service.create.mockRejectedValue(new Error('unexpected'));

    const res = await buildApp(service).request('/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    const body = await res.json() as { error: string };

    expect(body.error).toBe('Internal server error');
  });
});

// ─── GET /users/:id ───────────────────────────────────────────────────────────

describe('GET /users/:id — get user by id', () => {
  test('returns 200 when user is found', async () => {
    const service = makeMockService();
    service.findById.mockResolvedValue(ALICE);

    const res = await buildApp(service).request('/users/1');

    expect(res.status).toBe(200);
  });

  test('response body contains the user', async () => {
    const service = makeMockService();
    service.findById.mockResolvedValue(ALICE);

    const res = await buildApp(service).request('/users/1');

    expect(await res.json()).toMatchObject({ id: '1', name: 'Alice', email: 'alice@example.com' });
  });

  test('passes the id path param to service.findById', async () => {
    const service = makeMockService();
    service.findById.mockResolvedValue(ALICE);

    await buildApp(service).request('/users/abc-123');

    expect(service.findById).toHaveBeenCalledWith('abc-123');
  });

  test('returns 404 when service throws NotFoundError', async () => {
    const service = makeMockService();
    service.findById.mockRejectedValue(new NotFoundError('User abc not found'));

    const res = await buildApp(service).request('/users/abc');

    expect(res.status).toBe(404);
  });

  test('404 response body contains an error message', async () => {
    const service = makeMockService();
    service.findById.mockRejectedValue(new NotFoundError('User abc not found'));

    const res = await buildApp(service).request('/users/abc');
    const body = await res.json() as { error: string };

    expect(typeof body.error).toBe('string');
    expect(body.error.length).toBeGreaterThan(0);
  });

  test('returns 500 when service throws an unexpected error', async () => {
    const service = makeMockService();
    service.findById.mockRejectedValue(new Error('DB failure'));

    const res = await buildApp(service).request('/users/1');

    expect(res.status).toBe(500);
  });

  test('500 response body has error field with "Internal server error"', async () => {
    const service = makeMockService();
    service.findById.mockRejectedValue(new Error('unexpected'));

    const res = await buildApp(service).request('/users/1');
    const body = await res.json() as { error: string };

    expect(body.error).toBe('Internal server error');
  });
});

// ─── GET /users ───────────────────────────────────────────────────────────────

describe('GET /users — list all users', () => {
  test('returns 200', async () => {
    const service = makeMockService();
    service.findAll.mockResolvedValue([ALICE]);

    const res = await buildApp(service).request('/users');

    expect(res.status).toBe(200);
  });

  test('response body is an array', async () => {
    const service = makeMockService();
    service.findAll.mockResolvedValue([ALICE]);

    const body = await (await buildApp(service).request('/users')).json();

    expect(Array.isArray(body)).toBe(true);
  });

  test('response body contains all returned users', async () => {
    const service = makeMockService();
    service.findAll.mockResolvedValue([ALICE]);

    const body = await (await buildApp(service).request('/users')).json() as unknown[];

    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: '1', name: 'Alice' });
  });

  test('returns 200 with empty array when no users exist', async () => {
    const service = makeMockService();
    service.findAll.mockResolvedValue([]);

    const res = await buildApp(service).request('/users');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});

// ─── PUT /users/:id ───────────────────────────────────────────────────────────

describe('PUT /users/:id — update user', () => {
  test('returns 200 with updated user', async () => {
    const service = makeMockService();
    service.update.mockResolvedValue({ ...ALICE, name: 'Alice Updated' });

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    });

    expect(res.status).toBe(200);
  });

  test('response body contains the updated user', async () => {
    const service = makeMockService();
    service.update.mockResolvedValue({ ...ALICE, name: 'Alice Updated' });

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    });

    expect(await res.json()).toMatchObject({ name: 'Alice Updated' });
  });

  test('passes the id and partial body to service.update', async () => {
    const service = makeMockService();
    service.update.mockResolvedValue({ ...ALICE, name: 'Alice Updated' });

    await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    });

    expect(service.update).toHaveBeenCalledWith('1', { name: 'Alice Updated' });
  });

  test('returns 404 when service throws NotFoundError', async () => {
    const service = makeMockService();
    service.update.mockRejectedValue(new NotFoundError('User missing not found'));

    const res = await buildApp(service).request('/users/missing', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' }),
    });

    expect(res.status).toBe(404);
  });

  test('non-JSON body is treated as an empty update (no-op)', async () => {
    const service = makeMockService();
    service.update.mockResolvedValue(ALICE);

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json at all',
    });

    // updateUserSchema.safeParse({}) succeeds — all fields optional — so service is called
    expect(res.status).toBe(200);
    expect(service.update).toHaveBeenCalledWith('1', {});
  });

  test('400 response body has an error field', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-valid' }),
    });
    const body = await res.json() as { error: string };

    expect(body.error).toBeDefined();
  });

  test('returns 400 when update body contains invalid email', async () => {
    const service = makeMockService();

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-valid' }),
    });

    expect(res.status).toBe(400);
  });

  test('does not call service.update when validation fails', async () => {
    const service = makeMockService();

    await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad' }),
    });

    expect(service.update).not.toHaveBeenCalled();
  });

  test('returns 409 when service throws DuplicateEmailError', async () => {
    const service = makeMockService();
    service.update.mockRejectedValue(new DuplicateEmailError('taken@example.com'));

    const res = await buildApp(service).request('/users/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'taken@example.com' }),
    });

    expect(res.status).toBe(409);
  });
});

// ─── DELETE /users/:id ────────────────────────────────────────────────────────

describe('DELETE /users/:id — delete user', () => {
  test('returns 204 on successful deletion', async () => {
    const service = makeMockService();
    service.delete.mockResolvedValue(undefined);

    const res = await buildApp(service).request('/users/1', { method: 'DELETE' });

    expect(res.status).toBe(204);
  });

  test('passes the id to service.delete', async () => {
    const service = makeMockService();
    service.delete.mockResolvedValue(undefined);

    await buildApp(service).request('/users/1', { method: 'DELETE' });

    expect(service.delete).toHaveBeenCalledWith('1');
  });

  test('returns 404 when service throws NotFoundError', async () => {
    const service = makeMockService();
    service.delete.mockRejectedValue(new NotFoundError('User missing not found'));

    const res = await buildApp(service).request('/users/missing', { method: 'DELETE' });

    expect(res.status).toBe(404);
  });

  test('returns 500 when service throws an unexpected error', async () => {
    const service = makeMockService();
    service.delete.mockRejectedValue(new Error('unexpected'));

    const res = await buildApp(service).request('/users/1', { method: 'DELETE' });

    expect(res.status).toBe(500);
  });

  test('500 response body has error field with "Internal server error"', async () => {
    const service = makeMockService();
    service.delete.mockRejectedValue(new Error('unexpected'));

    const res = await buildApp(service).request('/users/1', { method: 'DELETE' });
    const body = await res.json() as { error: string };

    expect(body.error).toBe('Internal server error');
  });
});
