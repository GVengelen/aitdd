import { NotFoundError } from "../../lib/errors";
import type { UsersRepository } from "./users.repository";
import type { CreateUserInput, UpdateUserInput, User } from "./users.schemas";

export function createUsersService(repo: UsersRepository) {
  return {
    create(input: CreateUserInput): Promise<User> {
      return repo.create(input);
    },

    async findById(id: string): Promise<User> {
      const user = await repo.findById(id);
      if (!user) throw new NotFoundError(`User ${id} not found`);
      return user;
    },

    findAll(): Promise<User[]> {
      return repo.findAll();
    },

    async update(id: string, input: UpdateUserInput): Promise<User> {
      const user = await repo.findById(id);
      if (!user) throw new NotFoundError(`User ${id} not found`);
      return repo.update(id, input);
    },

    async delete(id: string): Promise<void> {
      const user = await repo.findById(id);
      if (!user) throw new NotFoundError(`User ${id} not found`);
      return repo.delete(id);
    },
  };
}

export type UsersService = ReturnType<typeof createUsersService>;

import { prismaUsersRepository } from "./users.repository";
export const usersService = createUsersService(prismaUsersRepository);
