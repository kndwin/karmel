import { Hono, MiddlewareHandler } from "hono";
import { getDB } from "~/server/database/client";

const dbMiddleware: MiddlewareHandler<{
  Bindings: {
    TURBO_URL: string;
    TURBO_TOKEN: string;
  };
  Variables: {
    db: ReturnType<typeof getDB>;
  };
}> = async (c, next) => {
  c.set(
    "db",
    getDB({
      authToken: c.env.TURBO_TOKEN,
      url: c.env.TURBO_URL,
    })
  );

  await next();
};

export const middleware = {
  db: dbMiddleware,
};
