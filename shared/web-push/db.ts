import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { user } from "../auth/db";

export const webpushSubscriptions = sqliteTable("webpush_subscriptions", {
  userId: text("user_id")
    .notNull()
    .references(() => user.id)
    .primaryKey(),
  endpoint: text("endpoint").notNull(),
  keysP256dh: text("keysP256dh").notNull(),
  keysAuth: text("keysAuth").notNull(),
});

export const webpushSubscriptionsRelations = relations(
  webpushSubscriptions,
  ({ one }) => ({
    user: one(user, {
      fields: [webpushSubscriptions.userId],
      references: [user.id],
    }),
  })
);

export const zod = {
  webpushSubscriptions: {
    insert: createInsertSchema(webpushSubscriptions),
    select: createSelectSchema(webpushSubscriptions),
  },
};
