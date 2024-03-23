import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";

import { getDB } from ".";

export const dbMiddleware: MiddlewareHandler<{
  Bindings: {
    TURSO_URL: string;
    TURSO_TOKEN: string;
  };
  Variables: {
    db: ReturnType<typeof getDB>;
  };
}> = createMiddleware(async (c, next) => {
  c.set(
    "db",
    getDB({
      authToken: env(c).TURSO_TOKEN,
      url: env(c).TURSO_URL,
    })
  );

  await next();
});
