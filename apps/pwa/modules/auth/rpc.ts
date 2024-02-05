import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia, Session, generateId } from "lucia";
import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { env } from "hono/adapter";
import { GitHub, generateState, OAuth2RequestError } from "arctic";
import { serializeCookie, parseCookies } from "oslo/cookie";

import { route } from "~/server/rpc";
import { getDB } from "~/server/database/client";
import { User } from "lucia";

declare module "lucia" {
  interface Register {
    Lucia: Lucia;
  }
}

const luciaMiddleware: MiddlewareHandler<{
  Bindings: {
    TURSO_TOKEN: string;
    TURSO_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ENV: string;
  };
  Variables: {
    db: ReturnType<typeof getDB>;
    auth: {
      lucia: Lucia;
      github: GitHub;
    };
  };
}> = async (c, next) => {
  const adapter = new DrizzleSQLiteAdapter(
    // @ts-expect-error: Type is unnessarily too strict lol
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
};

export const sessionMiddleware: MiddlewareHandler<{
  Variables: {
    auth: {
      lucia: Lucia;
    };
    user: User | null;
    session: Session | null;
  };
}> = async (c, next) => {
  const {
    auth: { lucia },
  } = c.var;
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
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
  c.set("user", user);
  c.set("session", session);
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

export const authRoute = route
  .use("*", luciaMiddleware)
  .use(luciaMiddleware)
  .use("*", sessionMiddleware)
  .use(sessionMiddleware)
  .get("/login/github", async (c): Promise<Response> => {
    const state = generateState();
    const url = await c.var.auth.github.createAuthorizationURL(state);

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
        "Set-Cookie": serializeCookie("github_oauth_state", state, {
          httpOnly: true,
          secure: env(c).ENV === "PRODUCTION", // set `Secure` flag in HTTPS
          maxAge: 60 * 10, // 10 minutes
          path: "/",
        }),
      },
    });
  })
  .get("/login/github/callback", async (c) => {
    // Initialize variables and methods
    const {
      db,
      auth: { lucia, github },
    } = c.var;
    const request = c.req;
    async function doesGithubUserExist(id: string) {
      return await db.query.oauth.findFirst({
        where: (oauth, { eq, and }) =>
          and(eq(oauth.providerUserId, id), eq(oauth.providerId, "github")),
      });
    }
    async function insertGithubUser(id: string) {
      const userId = generateId(15);
      await db.transaction(async (tx) => {
        await tx.insert(db.schema.user).values({
          id: userId,
        });
        await tx.insert(db.schema.oauth).values({
          providerId: "github",
          providerUserId: id,
          userId,
        });
      });
      return userId;
    }

    // Below code follow Web standard so you can copy and paste it to your project
    const cookies = parseCookies(request.headers.get("Cookie") ?? "");
    const stateCookie = cookies.get("github_oauth_state") ?? null;

    const url = new URL(request.url);
    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");

    // verify state
    if (!state || !stateCookie || !code || stateCookie !== state) {
      return new Response(null, {
        status: 400,
      });
    }

    try {
      const tokens = await github.validateAuthorizationCode(code);
      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          "User-Agent": "auth-server",
        },
      });
      const githubUserResult = await githubUserResponse.json();

      const existingUser = await doesGithubUserExist(githubUserResult.id);

      if (existingUser) {
        const session = await lucia.createSession(existingUser.userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
          },
        });
      }

      const userId = await insertGithubUser(githubUserResult.id);

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie": sessionCookie.serialize(),
        },
      });
    } catch (e) {
      console.log(e);
      if (e instanceof OAuth2RequestError) {
        return new Response(null, { status: 400 });
      }
      return new Response(null, { status: 500 });
    }
  })
  .get("/logout", protectedMiddleware, async (c) => {
    await c.var.auth.lucia.invalidateSession(c.var.session?.id ?? "");
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": c.var.auth.lucia.createBlankSessionCookie().serialize(),
      },
    });
  });
