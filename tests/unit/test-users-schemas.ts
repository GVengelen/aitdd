import { createUserSchema, updateUserSchema } from '../../src/modules/users/users.schemas';

// ─── createUserSchema ─────────────────────────────────────────────────────────

describe('createUserSchema — valid input', () => {
  test('accepts a valid name and email', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'alice@example.com' });
    expect(result.success).toBe(true);
  });

  test('parsed data contains name and email', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'alice@example.com' });
    if (!result.success) throw new Error('Expected success');
    expect(result.data).toMatchObject({ name: 'Alice', email: 'alice@example.com' });
  });
});

describe('createUserSchema — email normalisation', () => {
  test('converts email to lowercase', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'Alice@EXAMPLE.COM' });
    if (!result.success) throw new Error('Expected success');
    expect(result.data.email).toBe('alice@example.com');
  });

  test('mixed-case local part is also lowercased', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'Alice.Smith@Example.com' });
    if (!result.success) throw new Error('Expected success');
    expect(result.data.email).toBe('alice.smith@example.com');
  });
});

describe('createUserSchema — name validation', () => {
  test('rejects missing name', () => {
    const result = createUserSchema.safeParse({ email: 'alice@example.com' });
    expect(result.success).toBe(false);
  });

  test('rejects empty string name', () => {
    const result = createUserSchema.safeParse({ name: '', email: 'alice@example.com' });
    expect(result.success).toBe(false);
  });

  test('accepts single-character name', () => {
    const result = createUserSchema.safeParse({ name: 'A', email: 'a@example.com' });
    expect(result.success).toBe(true);
  });
});

describe('createUserSchema — email validation', () => {
  test('rejects missing email', () => {
    const result = createUserSchema.safeParse({ name: 'Alice' });
    expect(result.success).toBe(false);
  });

  test('rejects email without @ sign', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  test('rejects email with no domain', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: 'alice@' });
    expect(result.success).toBe(false);
  });

  test('rejects email with no local part', () => {
    const result = createUserSchema.safeParse({ name: 'Alice', email: '@example.com' });
    expect(result.success).toBe(false);
  });

  test('rejects extra fields being silently kept — only name and email are in parsed data', () => {
    const result = createUserSchema.safeParse({
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin',
    });
    if (!result.success) throw new Error('Expected success');
    expect((result.data as Record<string, unknown>).role).toBeUndefined();
  });
});

// ─── updateUserSchema ─────────────────────────────────────────────────────────

describe('updateUserSchema — valid partial inputs', () => {
  test('accepts name only', () => {
    const result = updateUserSchema.safeParse({ name: 'Bob' });
    expect(result.success).toBe(true);
  });

  test('accepts email only', () => {
    const result = updateUserSchema.safeParse({ email: 'bob@example.com' });
    expect(result.success).toBe(true);
  });

  test('accepts both name and email', () => {
    const result = updateUserSchema.safeParse({ name: 'Bob', email: 'bob@example.com' });
    expect(result.success).toBe(true);
  });

  test('accepts empty object (no-op update)', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('updateUserSchema — invalid inputs', () => {
  test('rejects empty string name', () => {
    const result = updateUserSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  test('rejects invalid email format', () => {
    const result = updateUserSchema.safeParse({ email: 'not-valid' });
    expect(result.success).toBe(false);
  });

  test('normalizes email to lowercase in update', () => {
    const result = updateUserSchema.safeParse({ email: 'BOB@EXAMPLE.COM' });
    if (!result.success) throw new Error('Expected success');
    expect(result.data.email).toBe('bob@example.com');
  });
});
