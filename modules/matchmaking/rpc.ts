import { eq } from "drizzle-orm";
import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { logger } from "hono/logger";

import { ulid } from "/shared/server/utils";
import { buildWebpushRequest } from "/shared/web-push";
import {
  luciaMiddleware,
  protectedMiddleware,
  sessionMiddleware,
} from "/shared/auth/middleware";
import { dbMiddleware } from "/shared/server/db/middleware";

import { zod } from "./db";

const QUEUE_RESPONSE_CODES = [
  "IN_QUEUE",
  "ALREADY_IN_ROOM",
  "NOT_IN_QUEUE",
  "NOT_ENOUGH_PLAYERS",
  "FOUND_PLAYERS",
] as const;

export type QueueResponseCode = (typeof QUEUE_RESPONSE_CODES)[number];

export const queueRoute = new Hono()
  .use(logger())
  .use("*", dbMiddleware)
  .use("*", luciaMiddleware)
  .use("*", sessionMiddleware)
  .use("*", protectedMiddleware)
  .use(dbMiddleware)
  .use(luciaMiddleware)
  .use(sessionMiddleware)
  .use(protectedMiddleware)
  .post("/join-queue", zValidator("json", zod.queue.insert), async (c) => {
    const db = c.var.db;
    const body = c.req.valid("json");

    await db.insert(db.schema.queue).values({
      userId: body.userId,
      gameType: body.gameType,
      gameSize: body.gameSize,
      lastHeartbeat: new Date(Date.now()),
    });

    const playersInQueueWithSameGame = await db.query.queue.findMany({
      where: (queue, { eq }) => eq(queue.gameType, body.gameType),
    });

    if (playersInQueueWithSameGame.length === body.gameSize) {
      const roomId = await db.transaction(async (tx) => {
        const removePlayersFromQueuePromises = playersInQueueWithSameGame.map(
          (player) => {
            return tx
              .delete(db.schema.queue)
              .where(eq(db.schema.queue.userId, player.userId));
          }
        );
        await Promise.all(removePlayersFromQueuePromises);

        const roomId = ulid();

        const createRoomPromises = playersInQueueWithSameGame.map((player) => {
          return tx.insert(db.schema.room).values({
            roomId,
            userId: player.userId,
            gameType: player.gameType,
            userStatus: "idle",
          });
        });

        await Promise.all(createRoomPromises);

        return roomId;
      });

      const subscriptions = await db.query.webpushSubscriptions.findMany({
        where: (sub, { inArray }) =>
          inArray(
            sub.userId,
            playersInQueueWithSameGame.map((p) => p.userId)
          ),
      });

      const sentNotificationPromises = subscriptions.map(async (sub) => {
        const request = await buildWebpushRequest({
          payload: {
            title: "Queue finished",
            body: "Entering the room",
            code: "FOUND_PLAYERS",
            data: {
              roomId,
            },
          },
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keysP256dh,
              auth: sub.keysAuth,
            },
          },
        });
        return fetch(request);
      });

      Promise.all(sentNotificationPromises);

      return c.json({
        status: "success",
        code: "FOUND_PLAYERS",
        data: { reason: "Found enough players", roomId },
      });
    }

    return c.json({
      status: "success",
      code: "IN_QUEUE",
      data: { reason: "Successfully in queue" },
    });
  })
  .get("/check-queue", async (c) => {
    const db = c.var.db;
    const userId = c.var.session?.userId as string;

    const userInQueue = await db.query.queue.findFirst({
      where: (queue, { eq }) => eq(queue.userId, userId),
    });

    if (!userInQueue) {
      const isUserInRoom = await db.query.room.findFirst({
        where: (room, { eq }) => eq(room.userId, userId),
      });

      if (isUserInRoom) {
        return c.json({
          status: "fail",
          code: "ALREADY_IN_ROOM",
          data: {
            reason: "User is in room",
            roomId: isUserInRoom.roomId,
          },
        });
      }

      return c.json({
        status: "fail",
        code: "NOT_IN_QUEUE",
        data: {
          reason: "User is not in queue",
          roomId: null,
        },
      });
    }

    const playersInQueueWithSameGame = await db.query.queue.findMany({
      where: (queue, { eq }) => eq(queue.gameType, userInQueue.gameType),
    });

    if (playersInQueueWithSameGame.length < userInQueue.gameSize) {
      await db.update(db.schema.queue).set({
        lastHeartbeat: new Date(Date.now()),
      });
      return c.json({
        status: "fail",
        code: "NOT_ENOUGH_PLAYERS" as QueueResponseCode,
        data: {
          reason: "Not enough players",
          roomId: null,
        },
      });
    }

    const roomId = await db.transaction(async (tx) => {
      const removePlayersFromQueuePromises = playersInQueueWithSameGame.map(
        (player) => {
          return tx
            .delete(db.schema.queue)
            .where(eq(db.schema.queue.userId, player.userId));
        }
      );
      await Promise.all(removePlayersFromQueuePromises);

      const roomId = ulid();

      const createRoomPromises = playersInQueueWithSameGame.map((player) => {
        return tx.insert(db.schema.room).values({
          roomId,
          userId: player.userId,
          gameType: player.gameType,
          userStatus: "idle",
        });
      });

      await Promise.all(createRoomPromises);

      return roomId;
    });

    return c.json({
      status: "success",
      code: "FOUND_PLAYERS",
      data: { reason: "Found enough players", roomId },
    });
  })
  .post(
    "/save-web-push-subscription",
    zValidator(
      "json",
      z.object({
        subscription: z.object({
          endpoint: z.string(),
          keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
          }),
        }),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const db = c.var.db;
      await db
        .insert(db.schema.webpushSubscriptions)
        .values({
          endpoint: body.subscription.endpoint,
          keysP256dh: body.subscription.keys.p256dh,
          keysAuth: body.subscription.keys.auth,
          userId: c.var.user.id,
        })
        .onConflictDoUpdate({
          target: db.schema.webpushSubscriptions.userId,
          set: {
            endpoint: body.subscription.endpoint,
            keysP256dh: body.subscription.keys.p256dh,
            keysAuth: body.subscription.keys.auth,
          },
        });
      return c.json({ status: "success" });
    }
  );

export const roomRoute = new Hono()
  .use("*", dbMiddleware)
  .use("*", luciaMiddleware)
  .use("*", sessionMiddleware)
  .use("*", protectedMiddleware)
  .use(dbMiddleware)
  .use(luciaMiddleware)
  .use(sessionMiddleware)
  .use(protectedMiddleware)
  .get(
    "/get-room-details",
    zValidator(
      "query",
      z.object({
        roomId: z.string(),
      })
    ),
    async (c) => {
      const { roomId } = c.req.valid("query");
      const otherPlayers = await c.var.db.query.room.findMany({
        where: (room, { eq }) => eq(room.roomId, roomId),
        with: {
          user: true,
        },
      });
      return c.json({
        status: "success",
        data: {
          otherPlayers,
        },
      });
    }
  );
