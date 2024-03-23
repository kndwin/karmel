import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { useQueue } from "/modules/matchmaking/hooks";

import { Button } from "~/shared/ui/button";
import { rpc } from "~/shared/rpc";

const roomSearchParam = z.object({
  roomId: z.string().catch(""),
});

export const Route = createFileRoute("/home/glada")({
  component: Component,
  validateSearch: roomSearchParam,
  loaderDeps: ({ search: { roomId } }) => ({ roomId }),
  loader: async ({ deps: { roomId } }) => {
    const res = await rpc.api.room["get-room-details"].$get({
      query: { roomId },
    });
    return await res.json();
  },
});

function Component() {
  const { roomId } = Route.useSearch();
  const queue = useQueue({ roomId });

  return (
    <div className="px-8 h-full flex flex-1 pb-8">
      <div className="rounded border w-[400px]">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-2 flex-1">
            <img
              alt="Game"
              className="w-16 h-16 rounded-lg aspect-square object-cover"
              src="https://api.dicebear.com/7.x/shapes/svg?seed=Go"
            />
            <div className="space-y-1">
              <h1 className="text-xl font-bold">Glada</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {queue.queueStatus}
              </p>
            </div>
          </div>
        </div>
        {queue.queueStatus === "found" && (
          <div className="flex flex-col gap-2 py-2 px-4">
            {queue.roomData.presence.map(({ user }) => (
              <div key={user.id} className="flex flex-row gap-2 items-center">
                <img src={user.avatarUrl} className="w-8 h-8 rounded-full" />
                <p>{user.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Queue {...queue} />
    </div>
  );
}

function Queue(props: ReturnType<typeof useQueue>) {
  return (
    <div className="flex flex-1">
      <div className="m-auto">
        <div className="flex items-center gap-3">
          {props.queueStatus === "idle" && (
            <Button onClick={props.startQueuing}>Start Queue</Button>
          )}
          {props.queueStatus === "pending" && (
            <div className="px-4 py-2 rounded border gap-2 items-center flex flex-row">
              Finding players...
              <div className="bg-green-500 h-4 w-4 rounded-full animate-pulse" />
            </div>
          )}

          {props.queueStatus === "found" && (
            <div className="">
              <p className="text-xl">Game found!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
