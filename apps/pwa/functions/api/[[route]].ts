import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";

import { authRoute } from "~/modules/auth/rpc";

const nameRoute = new Hono().get(
  "/name",
  zValidator(
    "query",
    z.object({
      name: z.string().optional(),
    })
  ),
  (c) => {
    const { name } = c.req.valid("query");
    return c.json({ message: `Hello ${name}` });
  }
);

const app = new Hono()
  .basePath("/api")
  .route("/name", nameRoute)
  .route("/auth", authRoute);
app.use(cors({ origin: "*" }));

export type AppType = typeof app;
export const onRequest = handle(app);
