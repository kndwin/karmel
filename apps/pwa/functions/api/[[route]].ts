import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";

const app = new Hono().basePath("/api");

app.use(cors({ origin: "*" }));
const root = app.get(
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

export type AppType = typeof root;
export const onRequest = handle(app);
