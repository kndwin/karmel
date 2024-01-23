import { handle } from "hono/cloudflare-pages";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoute } from "~/modules/auth/rpc";
import { showRoutes, getRouterName } from "hono/dev";

export const app = new Hono().basePath("/api").route("/auth", authRoute);
app.use(cors({ origin: "*" }));

showRoutes(app);
console.log(getRouterName(app));

export type AppType = typeof app;

export const onRequest = handle(app);
