import type { Config } from "drizzle-kit";

export default {
  schema: ["../../modules/**/db.ts", "../../shared/**/db.ts"],
  out: "./migrations",
  driver: "turso",
  dbCredentials: {
    url: process.env.TURSO_URL as string,
    authToken: process.env.TURSO_TOKEN as string,
  },
} satisfies Config;
