import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { ulid } from "/shared/server/utils";
import { user } from "/shared/auth/db";

export const queue = sqliteTable("queue", {
  id: text("id")
    .$defaultFn(() => ulid())
    .primaryKey(),
  updatedAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  userId: text("user_id").notNull(),
  gameType: text("game_type").notNull(),
  gameSize: integer("game_size").notNull(),
  lastHeartbeat: integer("last_heartbeat", { mode: "timestamp" }),
});

export const queueRelations = relations(queue, ({ one }) => ({
  user: one(user, {
    fields: [queue.userId],
    references: [user.id],
  }),
}));

export const room = sqliteTable("room", {
  id: text("id")
    .$defaultFn(() => ulid())
    .primaryKey(),
  roomId: text("room_id").notNull(),
  updatedAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  gameType: text("game_type").notNull(),
  userId: text("user_id").notNull(),
  userStatus: text("status", { enum: ["idle", "ready", "started"] }).notNull(),
});

export const roomRelations = relations(room, ({ one }) => ({
  user: one(user, {
    fields: [room.userId],
    references: [user.id],
  }),
}));

export const zod = {
  queue: {
    insert: createInsertSchema(queue),
    select: createSelectSchema(queue),
  },
};
