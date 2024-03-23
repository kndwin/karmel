import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import * as auth from "/shared/auth/db";
import * as webpush from "/shared/web-push/db";
import * as queue from "/modules/matchmaking/db";

const schema = { ...auth, ...queue, ...webpush };

export type DB = ReturnType<typeof getDB>;

export function getLibSQLClient(env: { url: string; authToken: string }) {
  return createClient(env);
}

export function getDB(env: { url: string; authToken: string }) {
  return Object.assign(drizzle(createClient(env), { schema }), { schema });
}
