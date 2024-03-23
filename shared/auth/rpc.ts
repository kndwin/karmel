import { Lucia, generateId } from "lucia";
import { env } from "hono/adapter";
import { Hono } from "hono";
import { generateState, OAuth2RequestError } from "arctic";
import { serializeCookie, parseCookies } from "oslo/cookie";

import { dbMiddleware } from "/shared/server/db/middleware";

import {
  protectedMiddleware,
  sessionMiddleware,
  luciaMiddleware,
} from "./middleware";

export const authRoute = new Hono()
  .use("*", dbMiddleware)
  .use("*", luciaMiddleware)
  .use("*", sessionMiddleware)
  .use(sessionMiddleware)
  .use(luciaMiddleware)
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
    // TODO: find a better way to redirect to home page
    const redirectUrl = "https://localhost:5173/home";
    async function doesGithubUserExist(id: string) {
      const result = await db.query.oauth.findFirst({
        where: (oauth, { eq, and }) =>
          and(eq(oauth.providerUserId, id), eq(oauth.providerId, "github")),
      });
      return result;
    }
    async function insertGithubUser(githubResponse: GithubResponse) {
      const userId = generateId(15);
      await db.transaction(async (tx) => {
        await tx.insert(db.schema.user).values({
          id: userId,
          name: githubResponse.name,
          email: githubResponse.email,
          avatarUrl: githubResponse.avatar_url,
        });
        await tx.insert(db.schema.oauth).values({
          providerId: "github",
          providerUserId: `${githubResponse.id}`,
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
      const githubUserResult =
        (await githubUserResponse.json()) as GithubResponse;

      const existingUser = await doesGithubUserExist(`${githubUserResult.id}`);

      if (existingUser) {
        const session = await lucia.createSession(existingUser.userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectUrl,
            "Set-Cookie": sessionCookie.serialize(),
          },
        });
      }

      const userId = await insertGithubUser(githubUserResult);
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
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
  })
  .get("/me", protectedMiddleware, async (c) => {
    const user = await c.var.db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, c.var.user?.id ?? ""),
    });
    const session = c.var.session;

    return new Response(JSON.stringify({ user, session }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

type GithubResponse = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: string;
  blog: string;
  location: string;
  email: string;
  hireable: Record<string, unknown> | null;
  bio: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
};
