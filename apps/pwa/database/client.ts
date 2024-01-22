import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const libsqlClient =
  import.meta.env.NODE_ENV === "production"
    ? createClient({
        url: import.meta.env.TURSO_URL ?? "",
        authToken: import.meta.env.TURSO_TOKEN,
      })
    : createClient({
        url: "file:local.db",
        authToken: "...",
      });

export const db = drizzle(libsqlClient);
