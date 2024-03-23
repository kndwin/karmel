import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes, inspectRoutes } from "hono/dev";

import { authRoute } from "/shared/auth/rpc";
import { queueRoute, roomRoute } from "/modules/matchmaking/rpc";

const app = new Hono()
  .use("*", cors({ origin: "*", credentials: true }))
  .basePath("/api")
  .route("/queue", queueRoute)
  .route("/room", roomRoute)
  .route("/auth", authRoute);

showRoutes(app);
inspectRoutes(app).map((route) => {
  if (route.name === "[handler]") {
    console.log(`${route.path}`);
  }
});

export type AppType = typeof app;

export default app;
