import { hc } from "hono/client";
import type { AppType } from "../../functions/api/[[route]]";

export const rpc = hc<AppType>(
  // import.meta.env.MODE === "development" ? "/" : "http://0.0.0.0:8788",
  "http://0.0.0.0:8788",
  {}
);

console.log(import.meta.env);
