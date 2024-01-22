import type { AppType } from "~/functions/api/[[route]]";
import { hc } from "hono/client";

export const rpc = hc<AppType>("/").api;
