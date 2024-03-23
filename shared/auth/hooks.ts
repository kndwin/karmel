import { useQuery } from "@tanstack/react-query";
import type { Session as LuciaSession } from "lucia";
import { z } from "zod";
import { createContext, useContext } from "react";

import { rpc } from "/apps/pwa/src/shared/rpc";

import { zod } from "./db";

export function useSessionQuery() {
  const query = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await rpc.api.auth.me.$get();
      const json = (await res.json()) as Session;
      return json;
    },
  });
  return query;
}

type Session = {
  user: NonNullable<z.infer<typeof zod.user.select>>;
  session: LuciaSession;
};

export const SessionContext = createContext<Session>({} as Session);

export function useSession() {
  return useContext(SessionContext);
}
