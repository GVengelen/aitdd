import { prisma } from '../../lib/db';
import { DuplicateEmailError } from '../../lib/errors';
import type { User, CreateUserInput, UpdateUserInput } from './users.schemas';

export interface UsersRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

function isPrismaP2002(err: unknown): boolean {
  return err instanceof Error && (err as { code?: string }).code === 'P2002';
}

export const prismaUsersRepository: UsersRepository = {
  async create(input) {
    try {
      return await prisma.user.create({ data: input });
    } catch (err) {
      if (isPrismaP2002(err)) throw new DuplicateEmailError(input.email);
      throw err;
    }
  },

  findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },

  findAll() {
    return prisma.user.findMany();
  },

  async update(id, input) {
    try {
      return await prisma.user.update({ where: { id }, data: input });
    } catch (err) {
      if (isPrismaP2002(err) && input.email !== undefined) throw new DuplicateEmailError(input.email);
      throw err;
    }
  },

  async delete(id) {
    await prisma.user.delete({ where: { id } });
  },
};
