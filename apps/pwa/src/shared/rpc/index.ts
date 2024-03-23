import { hc } from "hono/client";
import type { AppType } from "/apps/api";

export const rpc = hc<AppType>(import.meta.env.BASE_API_URL, {});
