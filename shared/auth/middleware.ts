import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, Session } from "lucia";
import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { User } from "lucia";
import { createMiddleware } from "hono/factory";
import { env } from "hono/adapter";
import { GitHub } from "arctic";

import type { DB } from "/shared/server/db";

declare module "lucia" {
  interface Register {
    Lucia: Lucia;
  }
}

export const luciaMiddleware: MiddlewareHandler<{
  Bindings: {
    TURSO_TOKEN: string;
    TURSO_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ENV: string;
  };
  Variables: {
    db: DB;
    auth: {
      lucia: Lucia;
      github: GitHub;
    };
  };
}> = createMiddleware(async (c, next) => {
  const adapter = new DrizzleSQLiteAdapter(
    c.var.db,
    c.var.db.schema.session,
    c.var.db.schema.user
  );

  const lucia = new Lucia(adapter, {
    sessionCookie: {
      attributes: {
        secure: env(c).ENV === "production",
      },
    },
  });

  const github = new GitHub(
    env(c).GITHUB_CLIENT_ID,
    env(c).GITHUB_CLIENT_SECRET
  );
  c.set("auth", { lucia, github });

  await next();
});

export const sessionMiddleware: MiddlewareHandler<{
  Variables: {
    auth: {
      lucia: Lucia;
    };
    user: User;
    session: Session;
  };
}> = async (c, next) => {
  const lucia = c.var.auth.lucia;

  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    throw new Error("No session ID found");
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    // use `header()` instead of `setCookie()` to avoid TS errors
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true,
    });
  }
  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true,
    });
  }
  c.set("user", user as User);
  c.set("session", session as Session);

  return next();
};

export const protectedMiddleware: MiddlewareHandler<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}> = async (c, next) => {
  if (!c.var.user || !c.var.session) {
    return new Response(null, {
      status: 401,
      headers: {
        Location: "/login",
      },
    });
  }
  return next();
};
