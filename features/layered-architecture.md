# Feature: Layered Architecture

## Summary
Organize a Hono/TypeScript REST API into three strict layers — routes, services, and repositories — so that each layer has a single concern and can be tested in isolation.

## User Story
```
As a backend developer
I want to structure API modules into route, service, and repository layers
So that business logic is testable without HTTP, and data access is swappable without touching business logic
```

## Requirements
- [ ] Route layer (routes.ts) handles HTTP only: parse + validate input with Zod/zValidator, call a service, return a response. No DB access, no business logic.
- [ ] Service layer (service.ts) holds business logic and orchestration. Accepts and returns plain typed data — no Request/Response objects, no Hono imports.
- [ ] Repository layer (repository.ts) owns all data access (Prisma queries). Exposes a typed interface so callers don't depend on the ORM.
- [ ] Service receives its repository via lightweight constructor/factory injection (no DI framework) so tests can pass a mock repository.
- [ ] Zod schemas and inferred TypeScript types live in schemas.ts and are shared across layers — no ad-hoc types.
- [ ] Modules are self-contained: a module (e.g. `src/modules/users/`) must not import from another module directory. Cross-module data flows through shared services or events.
- [ ] All four error cases are handled: 404 (not found), 409 (duplicate email), 400 (validation failure), 500 (repository error).
- [ ] app.ts composes modules by registering their Hono routers — it does not contain business logic.

## Acceptance Criteria
```gherkin
# Happy path — create user
Given a POST /users request with valid { name, email }
When the route validates the body with zValidator and calls usersService.create()
Then the service calls repository.create() and the route returns 201 with the created user

# Happy path — get user
Given a GET /users/:id request with an existing user ID
When the route calls usersService.findById(id)
Then the service calls repository.findById(id) and the route returns 200 with the user object

# Validation error
Given a POST /users request with a missing or malformed email
When zValidator evaluates the body against the Zod schema
Then the route returns 400 with a structured validation error — the service is never called

# Duplicate email
Given a POST /users request with an email that already exists
When the service calls repository.create() and the repository signals a conflict
Then the service throws a typed DuplicateEmailError and the route returns 409

# User not found
Given a GET /users/:id request with an ID that does not exist in the DB
When the service calls repository.findById(id) and the repository returns null
Then the service throws a typed NotFoundError and the route returns 404

# Repository failure
Given any route request where the repository throws an unexpected error
When the service propagates the error
Then the route catches it and returns 500 without leaking internal details

# Layer boundary — service is HTTP-agnostic
Given a unit test for usersService
When the test calls service methods directly with plain typed arguments
Then no Hono/Request/Response types are needed — the service compiles and runs without Hono

# Layer boundary — no cross-module imports
Given a module at src/modules/orders/
When the linter or test checks its imports
Then it contains no import from src/modules/users/ or any other module directory
```

## Edge Cases
- What if `id` param is not a valid UUID/integer? Validate at the route layer with Zod before calling the service.
- What if email casing differs (`User@Example.com` vs `user@example.com`)? Normalize to lowercase in the service before passing to the repository.
- What if the repository throws a Prisma `P2002` unique constraint error? Map it to `DuplicateEmailError` inside the repository (not the service), so the service sees a typed error regardless of ORM.
- What if two modules need the same user data? They must go through `usersService`, not import from `users.repository.ts` directly.
- What if `app.ts` needs to pass shared middleware (auth, logging) across modules? Wire it in `app.ts` or `lib/` — not inside any module.

## Technical Details
- **Language/Framework**: TypeScript + Hono
- **Validation**: Zod + `@hono/zod-validator` (`zValidator` middleware)
- **ORM**: Prisma (repository maps Prisma errors to typed domain errors)
- **Module structure**:
  ```
  src/
    modules/
      users/
        users.routes.ts      # Hono router — HTTP in/out only
        users.service.ts     # Business logic, HTTP-agnostic
        users.repository.ts  # Prisma queries + error mapping
        users.schemas.ts     # Zod schemas + inferred types
    lib/
      db.ts                  # Prisma client singleton
      errors.ts              # Shared typed error classes
    app.ts                   # Compose + register module routers
  ```
- **Dependency injection**: Service factory accepts a repository instance; default export wires Prisma repository; tests inject a mock.
- **Error types** (in `lib/errors.ts`): `NotFoundError`, `DuplicateEmailError`, `ValidationError`

## Example Usage

**schemas.ts** — single source of truth for types:
```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().toLowerCase(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type User = { id: string; name: string; email: string; createdAt: Date };
```

**repository.ts** — Prisma queries, ORM errors mapped to domain errors:
```typescript
import { prisma } from '../../lib/db';
import { DuplicateEmailError } from '../../lib/errors';
import type { User, CreateUserInput } from './users.schemas';

export interface UsersRepository {
  create(input: CreateUserInput): Promise<User>;
  findById(id: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, input: Partial<CreateUserInput>): Promise<User>;
  delete(id: string): Promise<void>;
}

export const prismaUsersRepository: UsersRepository = {
  async create(input) {
    try {
      return await prisma.user.create({ data: input });
    } catch (e: any) {
      if (e.code === 'P2002') throw new DuplicateEmailError(input.email);
      throw e;
    }
  },
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },
  // ...
};
```

**service.ts** — business logic, no HTTP:
```typescript
import { NotFoundError } from '../../lib/errors';
import type { UsersRepository } from './users.repository';
import type { CreateUserInput, User } from './users.schemas';

export function createUsersService(repo: UsersRepository) {
  return {
    async create(input: CreateUserInput): Promise<User> {
      return repo.create(input); // DuplicateEmailError bubbles up from repo
    },
    async findById(id: string): Promise<User> {
      const user = await repo.findById(id);
      if (!user) throw new NotFoundError(`User ${id} not found`);
      return user;
    },
    async findAll(): Promise<User[]> {
      return repo.findAll();
    },
  };
}

// Default instance wired to Prisma
import { prismaUsersRepository } from './users.repository';
export const usersService = createUsersService(prismaUsersRepository);
```

**routes.ts** — HTTP only, delegates immediately to service:
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { usersService } from './users.service';
import { createUserSchema } from './users.schemas';
import { NotFoundError, DuplicateEmailError } from '../../lib/errors';

const router = new Hono();

router.post('/', zValidator('json', createUserSchema), async (c) => {
  const input = c.req.valid('json');
  try {
    const user = await usersService.create(input);
    return c.json(user, 201);
  } catch (e) {
    if (e instanceof DuplicateEmailError) return c.json({ error: e.message }, 409);
    throw e;
  }
});

router.get('/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const user = await usersService.findById(id);
    return c.json(user);
  } catch (e) {
    if (e instanceof NotFoundError) return c.json({ error: e.message }, 404);
    throw e;
  }
});

export { router as usersRouter };
```

**Unit test — service in isolation** (no Hono, mock repo):
```typescript
import { createUsersService } from '../src/modules/users/users.service';
import { NotFoundError } from '../src/lib/errors';

const mockRepo = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const service = createUsersService(mockRepo);

test('findById throws NotFoundError when user does not exist', async () => {
  mockRepo.findById.mockResolvedValue(null);
  await expect(service.findById('missing-id')).rejects.toThrow(NotFoundError);
});
```

## Success Criteria
When all tests pass for this feature:
- ✓ Route tests verify HTTP status codes and response shapes without touching the DB
- ✓ Service tests exercise all business logic with a mock repository — no Hono imports needed
- ✓ Repository tests verify Prisma error mapping (P2002 → DuplicateEmailError)
- ✓ Integration tests confirm full request → route → service → repository → DB roundtrip
- ✓ A test or lint rule confirms no cross-module imports exist

## Notes
- This feature defines the architecture pattern, not just one endpoint. All future modules (`orders/`, `products/`, etc.) must follow the same three-file structure.
- `lib/errors.ts` should be minimal — only shared error base classes. Module-specific error subtypes (if needed) live in the module.
- Hono's built-in error handler in `app.ts` can catch unhandled errors and return 500, reducing boilerplate in every route.
