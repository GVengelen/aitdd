// Prisma client is mocked so no database connection is required.
vi.mock('../../src/lib/db', () => ({
  prisma: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import type { MockedFunction } from 'vitest';
import { prisma } from '../../src/lib/db';
import { prismaUsersRepository } from '../../src/modules/users/users.repository';
import { DuplicateEmailError } from '../../src/lib/errors';

const db = prisma.user as unknown as {
  create: MockedFunction<typeof prisma.user.create>;
  findUnique: MockedFunction<typeof prisma.user.findUnique>;
  findMany: MockedFunction<typeof prisma.user.findMany>;
  update: MockedFunction<typeof prisma.user.update>;
  delete: MockedFunction<typeof prisma.user.delete>;
};

const ALICE = { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('prismaUsersRepository.create', () => {
  test('calls prisma.user.create with the provided data', async () => {
    db.create.mockResolvedValue(ALICE as never);

    await prismaUsersRepository.create({ name: 'Alice', email: 'alice@example.com' });

    expect(db.create).toHaveBeenCalledWith({
      data: { name: 'Alice', email: 'alice@example.com' },
    });
  });

  test('returns the created user', async () => {
    db.create.mockResolvedValue(ALICE as never);

    const result = await prismaUsersRepository.create({ name: 'Alice', email: 'alice@example.com' });

    expect(result).toEqual(ALICE);
  });

  test('maps Prisma P2002 error to DuplicateEmailError', async () => {
    const p2002 = Object.assign(new Error('Unique constraint violated'), { code: 'P2002' });
    db.create.mockRejectedValue(p2002);

    await expect(
      prismaUsersRepository.create({ name: 'Alice', email: 'alice@example.com' })
    ).rejects.toThrow(DuplicateEmailError);
  });

  test('propagates non-P2002 Prisma errors unchanged', async () => {
    const other = Object.assign(new Error('Connection refused'), { code: 'P2023' });
    db.create.mockRejectedValue(other);

    await expect(
      prismaUsersRepository.create({ name: 'Alice', email: 'alice@example.com' })
    ).rejects.toThrow('Connection refused');
  });

  test('DuplicateEmailError is not thrown for a different Prisma error code', async () => {
    const other = Object.assign(new Error('Some other error'), { code: 'P2003' });
    db.create.mockRejectedValue(other);

    await expect(
      prismaUsersRepository.create({ name: 'Alice', email: 'alice@example.com' })
    ).rejects.not.toThrow(DuplicateEmailError);
  });
});

// ─── findById ─────────────────────────────────────────────────────────────────

describe('prismaUsersRepository.findById', () => {
  test('calls prisma.user.findUnique with the provided id', async () => {
    db.findUnique.mockResolvedValue(ALICE as never);

    await prismaUsersRepository.findById('1');

    expect(db.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  test('returns the user when found', async () => {
    db.findUnique.mockResolvedValue(ALICE as never);

    const result = await prismaUsersRepository.findById('1');

    expect(result).toEqual(ALICE);
  });

  test('returns null when the user does not exist', async () => {
    db.findUnique.mockResolvedValue(null);

    const result = await prismaUsersRepository.findById('missing');

    expect(result).toBeNull();
  });
});

// ─── findAll ──────────────────────────────────────────────────────────────────

describe('prismaUsersRepository.findAll', () => {
  test('calls prisma.user.findMany', async () => {
    db.findMany.mockResolvedValue([ALICE] as never);

    await prismaUsersRepository.findAll();

    expect(db.findMany).toHaveBeenCalled();
  });

  test('returns all users', async () => {
    db.findMany.mockResolvedValue([ALICE] as never);

    const result = await prismaUsersRepository.findAll();

    expect(result).toEqual([ALICE]);
  });

  test('returns empty array when no users exist', async () => {
    db.findMany.mockResolvedValue([] as never);

    const result = await prismaUsersRepository.findAll();

    expect(result).toEqual([]);
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('prismaUsersRepository.update', () => {
  test('calls prisma.user.update with the id and data', async () => {
    const updated = { ...ALICE, name: 'Alice V2' };
    db.update.mockResolvedValue(updated as never);

    await prismaUsersRepository.update('1', { name: 'Alice V2' });

    expect(db.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: { name: 'Alice V2' },
    });
  });

  test('returns the updated user', async () => {
    const updated = { ...ALICE, name: 'Alice V2' };
    db.update.mockResolvedValue(updated as never);

    const result = await prismaUsersRepository.update('1', { name: 'Alice V2' });

    expect(result).toEqual(updated);
  });

  test('maps P2002 error to DuplicateEmailError on email conflict', async () => {
    const p2002 = Object.assign(new Error('Unique constraint violated'), { code: 'P2002' });
    db.update.mockRejectedValue(p2002);

    await expect(
      prismaUsersRepository.update('1', { email: 'taken@example.com' })
    ).rejects.toThrow(DuplicateEmailError);
  });

  test('propagates non-P2002 errors from prisma.user.update', async () => {
    const other = Object.assign(new Error('DB error'), { code: 'P2025' });
    db.update.mockRejectedValue(other);

    await expect(
      prismaUsersRepository.update('1', { name: 'Alice' })
    ).rejects.toThrow('DB error');
  });

  test('propagates P2002 unchanged when email was not part of the update', async () => {
    const p2002 = Object.assign(new Error('Unique constraint violated'), { code: 'P2002' });
    db.update.mockRejectedValue(p2002);

    await expect(
      prismaUsersRepository.update('1', { name: 'Alice' })
    ).rejects.not.toThrow(DuplicateEmailError);
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('prismaUsersRepository.delete', () => {
  test('calls prisma.user.delete with the provided id', async () => {
    db.delete.mockResolvedValue(ALICE as never);

    await prismaUsersRepository.delete('1');

    expect(db.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  test('resolves to undefined on success', async () => {
    db.delete.mockResolvedValue(ALICE as never);

    await expect(prismaUsersRepository.delete('1')).resolves.toBeUndefined();
  });
});
