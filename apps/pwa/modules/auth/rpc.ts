import { lucia } from "lucia";
import { libsql } from "@lucia-auth/adapter-sqlite";
import { libsqlClient } from "~/database/client";
import { github } from "@lucia-auth/oauth/providers";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";

const auth = lucia({
  adapter: libsql(libsqlClient, {
    user: "user",
    key: "user_key",
    session: "user_session",
  }),
  env: process.env.NODE_ENV == "production" ? "PROD" : "DEV",
});

const githubAuth = github(auth, {
  clientId: process.env.GITHUB_CLIENT_ID ?? "",
  clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
});

export const authRoute = new Hono()
  .get("/login/github", async (c) => {
    const [url, state] = await githubAuth.getAuthorizationUrl();
    setCookie(c, "github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
    return c.redirect(url.toString());
  })
  .get("/login", async (c) => {
    return c.json({ message: "Hello World" });
  });
