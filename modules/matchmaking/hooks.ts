import { useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { rpc } from "/apps/pwa/src/shared/rpc";
import { useSession } from "/shared/auth/hooks";

type PushData = {
  title: string;
  body: string;
  code: string;
  data: Record<string, any>;
};

export function useQueue({ roomId }: { roomId?: string }) {
  const { user } = useSession();
  const router = useRouter();

  const [queueStatus, setQueueStatus] = useState<
    "idle" | "pending" | "found" | "accepted"
  >(roomId ? "found" : "idle");

  const startQueueMutation = useMutation({
    mutationFn: () =>
      rpc.api.queue["join-queue"].$post({
        json: {
          gameType: "glada",
          gameSize: 2,
          userId: user.id,
        },
      }),
  });

  const checkQueueStatusQuery = useQuery({
    queryKey: ["check-queue"],
    queryFn: async () => {
      const res = await rpc.api.queue["check-queue"].$get();
      const data = await res.json();
      return data;
    },
    enabled: queueStatus === "pending",
    refetchInterval: 60_000,
  });

  function startQueuing() {
    setQueueStatus("pending");
    startQueueMutation.mutate();
  }

  const roomInfoQuery = useQuery({
    queryKey: ["room-info", roomId],
    queryFn: async () => {
      const res = await rpc.api.room["get-room-details"].$get({
        query: { roomId: roomId as string },
      });
      const data = await res.json();
      return data;
    },
    enabled: Boolean(roomId),
  });

  useEffect(() => {
    if (
      ["FOUND_PLAYERS", "ALREADY_IN_ROOM"].includes(
        checkQueueStatusQuery.data?.code as string
      )
    ) {
      setQueueStatus("found");
    }

    if (checkQueueStatusQuery.data?.data?.roomId) {
      router.navigate({
        search: { roomId: checkQueueStatusQuery.data?.data?.roomId },
      });
    }
  }, [checkQueueStatusQuery.data?.code]);

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      const payload = event.data as PushData;
      if (payload.code === "FOUND_PLAYERS") {
        setQueueStatus("found");
        router.navigate({
          search: { roomId: payload.data.roomId },
        });
      }
    };

    navigator.serviceWorker.addEventListener("message", messageHandler);

    return () => {
      navigator.serviceWorker.removeEventListener("message", messageHandler);
    };
  }, []);

  return {
    startQueuing,
    queueStatus,
    roomData: {
      presence: roomInfoQuery.data?.data?.otherPlayers ?? [],
    },
  };
}
