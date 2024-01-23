import { libsql } from "@lucia-auth/adapter-sqlite";
import { github } from "@lucia-auth/oauth/providers";
import { setCookie } from "hono/cookie";
import { Hono, MiddlewareHandler } from "hono";
import { lucia } from "lucia";
import { getLibSQLClient } from "~/server/database/client";

import { route } from "~/server/rpc";

const authMiddleware: MiddlewareHandler<{
  Bindings: {
    TURBO_TOKEN: string;
    TURBO_URL: string;
    GITHUB_CLIENT_ID: string;
    GITHUB_CLIENT_SECRET: string;
    ENV: string;
  };
  Variables: {
    auth: {
      lucia: ReturnType<typeof lucia>;
      github: ReturnType<typeof github>;
    };
  };
}> = async (c, next) => {
  const auth = lucia({
    adapter: libsql(
      getLibSQLClient({
        authToken: c.env.TURBO_TOKEN,
        url: c.env.TURBO_URL,
      }),
      {
        user: "user",
        key: "user_key",
        session: "user_session",
      }
    ),
    env: c.env.ENV === "production" ? "PROD" : "DEV",
  });

  const githubAuth = github(auth, {
    clientId: c.env.GITHUB_CLIENT_ID,
    clientSecret: c.env.GITHUB_CLIENT_SECRET,
  });
  c.set("auth", {
    lucia: auth,
    github: githubAuth,
  });
  await next();
};

export const authRoute = new Hono()
  .use(authMiddleware)
  .get("/login/github", async (c) => {
    const [url, state] = await c.var.auth.github.getAuthorizationUrl();
    setCookie(c, "github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
    return c.redirect(url.toString());
  })
  .get("/login", async (c) => {
    console.log("login");
    return c.redirect("https://github.com");
  })
  .get("/echo", (c) => c.text("echo"));
