import { Hono, type Context } from "hono";
import { NotFoundError, DuplicateEmailError } from "../../lib/errors";
import { createUserSchema, updateUserSchema } from "./users.schemas";
import type { UsersService } from "./users.service";

function mapError(err: unknown, c: Context) {
  if (err instanceof NotFoundError) return c.json({ error: err.message }, 404);
  if (err instanceof DuplicateEmailError)
    return c.json({ error: err.message }, 409);
  return c.json({ error: "Internal server error" }, 500);
}

export function createUsersRouter(service: UsersService): Hono {
  const router = new Hono();
  // Stryker disable next-line StringLiteral -- '' and '/' are the same for Hono
  router.get("/", async (c) => {
    const users = await service.findAll();
    return c.json(users);
  });
  // Stryker disable next-line StringLiteral -- '' and '/' are the same for Hono
  router.post("/", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const result = createUserSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        // Stryker disable next-line LogicalOperator,OptionalChaining,StringLiteral -- Zod always provides at least one issue; fallback is unreachable
        { error: result.error.issues[0]?.message ?? "Validation error" },
        400,
      );
    }
    try {
      const user = await service.create(result.data);
      return c.json(user, 201);
    } catch (err) {
      return mapError(err, c);
    }
  });

  router.get("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      const user = await service.findById(id);
      return c.json(user);
    } catch (err) {
      return mapError(err, c);
    }
  });

  router.put("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json().catch(() => ({}));
    const result = updateUserSchema.safeParse(body);
    if (!result.success) {
      return c.json(
        // Stryker disable next-line LogicalOperator,OptionalChaining,StringLiteral -- Zod always provides at least one issue; fallback is unreachable
        { error: result.error.issues[0]?.message ?? "Validation error" },
        400,
      );
    }
    try {
      const user = await service.update(id, result.data);
      return c.json(user);
    } catch (err) {
      return mapError(err, c);
    }
  });

  router.delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await service.delete(id);
      return c.body(null, 204);
    } catch (err) {
      return mapError(err, c);
    }
  });

  return router;
}
