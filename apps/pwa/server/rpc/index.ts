import { MiddlewareHandler, Hono } from "hono";
import { env } from "hono/adapter";

import { getDB } from "~/server/database/client";
import { sessionMiddleware, protectedMiddleware } from "~/modules/auth/rpc";

const dbMiddleware: MiddlewareHandler<{
  Bindings: {
    TURSO_URL: string;
    TURSO_TOKEN: string;
  };
  Variables: {
    db: ReturnType<typeof getDB>;
  };
}> = async (c, next) => {
  c.set(
    "db",
    getDB({
      authToken: env(c).TURSO_TOKEN,
      url: env(c).TURSO_URL,
    })
  );

  await next();
};

export const middleware = {
  db: dbMiddleware,
  session: sessionMiddleware,
  protected: protectedMiddleware,
};

export const route = new Hono().use(middleware.db).use("*", middleware.db);
