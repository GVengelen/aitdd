import { app } from '../../src/app';
import { prisma } from '../../src/lib/db';

type UserBody = { id: string; name: string; email: string };

beforeEach(async () => {
  await prisma.user.deleteMany();
});

// ─── Create → Read roundtrip ──────────────────────────────────────────────────

describe('Integration: create user', () => {
  test('POST then GET returns the same user', async () => {
    const createRes = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    expect(createRes.status).toBe(201);

    const created = await createRes.json() as UserBody;
    const getRes = await app.request(`/api/users/${created.id}`);
    expect(getRes.status).toBe(200);

    const fetched = await getRes.json() as UserBody;
    expect(fetched.name).toBe('Alice');
    expect(fetched.email).toBe('alice@example.com');
  });

  test('POST normalizes email to lowercase before storing', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'Alice@EXAMPLE.COM' }),
    });

    const body = await res.json() as UserBody;
    expect(body.email).toBe('alice@example.com');
  });

  test('second POST with same email returns 409', async () => {
    await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });

    const dupRes = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice 2', email: 'alice@example.com' }),
    });

    expect(dupRes.status).toBe(409);
  });

  test('POST with invalid email returns 400 and does not create a user', async () => {
    const postRes = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'bad-email' }),
    });
    expect(postRes.status).toBe(400);

    const listRes = await app.request('/api/users');
    const users = await listRes.json() as unknown[];
    expect(users).toHaveLength(0);
  });
});

// ─── CORS ─────────────────────────────────────────────────────────────────────

describe('Integration: CORS', () => {
  test('response includes Access-Control-Allow-Origin header', async () => {
    const res = await app.request('/api/users', {
      headers: { Origin: 'http://localhost:3000' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBeDefined();
  });
});

// ─── List users ───────────────────────────────────────────────────────────────

describe('Integration: list users', () => {
  test('GET /api/users returns empty array when no users exist', async () => {
    const res = await app.request('/api/users');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });

  test('GET /api/users reflects all created users', async () => {
    await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),
    });

    const res = await app.request('/api/users');
    const body = await res.json() as unknown[];

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
  });
});

// ─── Update user ──────────────────────────────────────────────────────────────

describe('Integration: update user', () => {
  test('PUT updates user name and GET reflects the change', async () => {
    const created = await (await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    })).json() as UserBody;

    const updateRes = await app.request(`/api/users/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice Updated' }),
    });
    expect(updateRes.status).toBe(200);

    const getRes = await app.request(`/api/users/${created.id}`);
    const fetched = await getRes.json() as UserBody;
    expect(fetched.name).toBe('Alice Updated');
  });

  test('PUT on non-existent user returns 404', async () => {
    const res = await app.request('/api/users/does-not-exist', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob' }),
    });

    expect(res.status).toBe(404);
  });

  test('PUT with duplicate email returns 409', async () => {
    const alice = await (await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    })).json() as UserBody;

    await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', email: 'bob@example.com' }),
    });

    const res = await app.request(`/api/users/${alice.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bob@example.com' }),
    });

    expect(res.status).toBe(409);
  });
});

// ─── Delete user ──────────────────────────────────────────────────────────────

describe('Integration: delete user', () => {
  test('DELETE removes the user — subsequent GET returns 404', async () => {
    const created = await (await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    })).json() as UserBody;

    const deleteRes = await app.request(`/api/users/${created.id}`, { method: 'DELETE' });
    expect(deleteRes.status).toBe(204);

    const getRes = await app.request(`/api/users/${created.id}`);
    expect(getRes.status).toBe(404);
  });

  test('DELETE removes the user — GET /api/users no longer lists it', async () => {
    const created = await (await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    })).json() as UserBody;

    await app.request(`/api/users/${created.id}`, { method: 'DELETE' });

    const listRes = await app.request('/api/users');
    const users = await listRes.json() as unknown[];
    expect(users).toHaveLength(0);
  });

  test('DELETE on non-existent user returns 404', async () => {
    const res = await app.request('/api/users/does-not-exist', { method: 'DELETE' });

    expect(res.status).toBe(404);
  });

  test('deleted user email can be re-used for a new user', async () => {
    const created = await (await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    })).json() as UserBody;

    await app.request(`/api/users/${created.id}`, { method: 'DELETE' });

    const reCreateRes = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice 2', email: 'alice@example.com' }),
    });

    expect(reCreateRes.status).toBe(201);
  });
});

// ─── Error response shapes ────────────────────────────────────────────────────

describe('Integration: error response shapes', () => {
  test('400 response has a JSON body with an error field', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'bad' }),
    });
    const body = await res.json() as Record<string, unknown>;

    expect(body.error).toBeDefined();
  });

  test('404 response has a JSON body with an error field', async () => {
    const res = await app.request('/api/users/not-found');
    const body = await res.json() as Record<string, unknown>;

    expect(body.error).toBeDefined();
  });

  test('409 response has a JSON body with an error field', async () => {
    await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
    });
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice 2', email: 'alice@example.com' }),
    });
    const body = await res.json() as Record<string, unknown>;

    expect(body.error).toBeDefined();
  });
});
