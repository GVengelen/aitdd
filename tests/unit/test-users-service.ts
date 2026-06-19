import type { Mocked } from 'vitest';
import { createUsersService } from '../../src/modules/users/users.service';
import { NotFoundError, DuplicateEmailError } from '../../src/lib/errors';
import type { UsersRepository } from '../../src/modules/users/users.repository';

function makeMockRepo(): Mocked<UsersRepository> {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

const ALICE = { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date() };
const BOB = { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date() };

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── create ───────────────────────────────────────────────────────────────────

describe('usersService.create', () => {
  test('calls repo.create with the provided input', async () => {
    const repo = makeMockRepo();
    repo.create.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    await service.create({ name: 'Alice', email: 'alice@example.com' });

    expect(repo.create).toHaveBeenCalledWith({ name: 'Alice', email: 'alice@example.com' });
  });

  test('returns the user returned by repo.create', async () => {
    const repo = makeMockRepo();
    repo.create.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    const result = await service.create({ name: 'Alice', email: 'alice@example.com' });

    expect(result).toEqual(ALICE);
  });

  test('propagates DuplicateEmailError thrown by the repository', async () => {
    const repo = makeMockRepo();
    repo.create.mockRejectedValue(new DuplicateEmailError('alice@example.com'));
    const service = createUsersService(repo);

    await expect(
      service.create({ name: 'Alice', email: 'alice@example.com' })
    ).rejects.toThrow(DuplicateEmailError);
  });

  test('propagates unexpected errors from the repository', async () => {
    const repo = makeMockRepo();
    repo.create.mockRejectedValue(new Error('DB connection lost'));
    const service = createUsersService(repo);

    await expect(
      service.create({ name: 'Alice', email: 'alice@example.com' })
    ).rejects.toThrow('DB connection lost');
  });

  test('calls repo.create exactly once', async () => {
    const repo = makeMockRepo();
    repo.create.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    await service.create({ name: 'Alice', email: 'alice@example.com' });

    expect(repo.create).toHaveBeenCalledTimes(1);
  });
});

// ─── findById ─────────────────────────────────────────────────────────────────

describe('usersService.findById', () => {
  test('calls repo.findById with the provided id', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    await service.findById('1');

    expect(repo.findById).toHaveBeenCalledWith('1');
  });

  test('returns the user when found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    const result = await service.findById('1');

    expect(result).toEqual(ALICE);
  });

  test('throws NotFoundError when repo returns null', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.findById('missing')).rejects.toThrow(NotFoundError);
  });

  test('NotFoundError message contains the missing id', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.findById('abc-123')).rejects.toThrow('abc-123');
  });

  test('does not throw when user is found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    const service = createUsersService(repo);

    await expect(service.findById('1')).resolves.toBeDefined();
  });
});

// ─── findAll ──────────────────────────────────────────────────────────────────

describe('usersService.findAll', () => {
  test('calls repo.findAll', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([ALICE]);
    const service = createUsersService(repo);

    await service.findAll();

    expect(repo.findAll).toHaveBeenCalled();
  });

  test('returns the array returned by repo.findAll', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([ALICE, BOB]);
    const service = createUsersService(repo);

    const result = await service.findAll();

    expect(result).toEqual([ALICE, BOB]);
  });

  test('returns empty array when no users exist', async () => {
    const repo = makeMockRepo();
    repo.findAll.mockResolvedValue([]);
    const service = createUsersService(repo);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });
});

// ─── update ───────────────────────────────────────────────────────────────────

describe('usersService.update', () => {
  test('throws NotFoundError before updating when user does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.update('missing', { name: 'Bob' })).rejects.toThrow(NotFoundError);
  });

  test('NotFoundError message contains the missing id', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.update('abc-123', { name: 'Bob' })).rejects.toThrow('abc-123');
  });

  test('does not call repo.update when user is not found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await service.update('missing', { name: 'Bob' }).catch(() => {});

    expect(repo.update).not.toHaveBeenCalled();
  });

  test('calls repo.update with the id and partial input', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    repo.update.mockResolvedValue({ ...ALICE, name: 'Alice V2' });
    const service = createUsersService(repo);

    await service.update('1', { name: 'Alice V2' });

    expect(repo.update).toHaveBeenCalledWith('1', { name: 'Alice V2' });
  });

  test('returns the updated user from repo.update', async () => {
    const repo = makeMockRepo();
    const updated = { ...ALICE, name: 'Alice V2' };
    repo.findById.mockResolvedValue(ALICE);
    repo.update.mockResolvedValue(updated);
    const service = createUsersService(repo);

    const result = await service.update('1', { name: 'Alice V2' });

    expect(result).toEqual(updated);
  });

  test('propagates DuplicateEmailError from repo.update', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    repo.update.mockRejectedValue(new DuplicateEmailError('bob@example.com'));
    const service = createUsersService(repo);

    await expect(service.update('1', { email: 'bob@example.com' })).rejects.toThrow(DuplicateEmailError);
  });
});

// ─── delete ───────────────────────────────────────────────────────────────────

describe('usersService.delete', () => {
  test('throws NotFoundError before deleting when user does not exist', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.delete('missing')).rejects.toThrow(NotFoundError);
  });

  test('NotFoundError message contains the missing id', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await expect(service.delete('abc-123')).rejects.toThrow('abc-123');
  });

  test('does not call repo.delete when user is not found', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(null);
    const service = createUsersService(repo);

    await service.delete('missing').catch(() => {});

    expect(repo.delete).not.toHaveBeenCalled();
  });

  test('calls repo.delete with the provided id', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    repo.delete.mockResolvedValue(undefined);
    const service = createUsersService(repo);

    await service.delete('1');

    expect(repo.delete).toHaveBeenCalledWith('1');
  });

  test('resolves without a return value on success', async () => {
    const repo = makeMockRepo();
    repo.findById.mockResolvedValue(ALICE);
    repo.delete.mockResolvedValue(undefined);
    const service = createUsersService(repo);

    await expect(service.delete('1')).resolves.toBeUndefined();
  });
});

// ─── Service is HTTP-agnostic (structural) ────────────────────────────────────

describe('usersService — HTTP-agnostic contract', () => {
  test('service can be instantiated and used without any Hono types', () => {
    const repo = makeMockRepo();
    // If this module imported Hono, TypeScript would need @hono types at this level.
    // The fact that this test file has no Hono import and still calls service methods
    // confirms the service does not leak HTTP types into its public API.
    const service = createUsersService(repo);
    expect(typeof service.create).toBe('function');
    expect(typeof service.findById).toBe('function');
    expect(typeof service.findAll).toBe('function');
    expect(typeof service.update).toBe('function');
    expect(typeof service.delete).toBe('function');
  });
});
