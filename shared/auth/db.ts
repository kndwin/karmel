import {
  sqliteTable,
  text,
  integer,
  primaryKey,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const oauth = sqliteTable(
  "oauth_accounts",
  {
    providerId: text("provider_id").notNull(),
    providerUserId: text("provider_user_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.providerId, table.userId] }),
  })
);

export const oauthRelations = relations(oauth, ({ one }) => ({
  user: one(user, {
    fields: [oauth.userId],
    references: [user.id],
  }),
}));

export const user = sqliteTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  avatarUrl: text("avatar_url").notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  expiresAt: integer("expires_at").notNull(),
});

export const zod = {
  user: {
    insert: createInsertSchema(user),
    select: createSelectSchema(user),
  },
};
