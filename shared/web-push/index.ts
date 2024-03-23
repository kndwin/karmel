import { buildRequest } from "./primitives/build-request";
import type { PushSubscription } from "./primitives/types";

export async function buildWebpushRequest({
  payload,
  subscription,
}: {
  payload: {
    title: string;
    body: string;
    code: string;
    data: Record<string, unknown>;
  };
  subscription: PushSubscription;
}) {
  const pushRequest = await buildRequest(
    {
      payload: JSON.stringify(payload),
      ttl,
      jwk,
      jwt: {
        aud: new URL(subscription.endpoint).origin,
        exp: Math.floor(Date.now() / 1000) + ttl,
        sub: "mailto:test@email.com",
      },
    },
    subscription
  );

  return pushRequest;
}

const ttl = 60 * 60 * 24;
const jwk = {
  kty: "EC",
  crv: "P-256",
  key_ops: ["sign"],
  x: "hZlxt9aj2xF2ZSR40_Zat05slVHKoV30bhcgwtiKuIw",
  y: "aomkSSbsk3S8nbrfWHoHBAKhKp_XsG26hcDnGA48-VI",
  d: "MKESFhwNFDCb-pC2zR8mowkyi9l0cg0tpLzoiLNNRts",
};
