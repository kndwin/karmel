import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";

import * as auth from "~/modules/auth/db";

export function getLibSQLClient(env: { url: string; authToken: string }) {
  return createClient(env);
}

export function getDB(env: { url: string; authToken: string }) {
  return drizzle(createClient(env), {
    schema: {
      ...auth,
    },
  });
}
