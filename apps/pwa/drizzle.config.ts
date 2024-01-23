import { config } from "dotenv";
import type { Config } from "drizzle-kit";
config();

export default {
	schema: "./modules/**/db.ts",
	out: "./database/migrations",
	driver: "turso",
	dbCredentials: {
		url: process.env.TURSO_URL as string,
		authToken: process.env.TURSO_TOKEN as string,
	},
} satisfies Config;
