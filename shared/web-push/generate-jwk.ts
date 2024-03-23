import { getPublicKeyFromJwk } from "./primitives/utils";

const keys = await crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"]
);

const jwk = await crypto.subtle.exportKey("jwk", keys.privateKey);

console.log({
  jwk,
  publicKey: getPublicKeyFromJwk(jwk),
  privateKey: jwk.d,
});
// Convert the public key to a JWK
