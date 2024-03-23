import { base64UrlDecodeString } from "./primitives/utils";

const vapid = {
  publicKey:
    "BIWZcbfWo9sRdmUkeNP2WrdObJVRyqFd9G4XIMLYiriMaomkSSbsk3S8nbrfWHoHBAKhKp_XsG26hcDnGA48-VI",
  privateKey: "MKESFhwNFDCb-pC2zR8mowkyi9l0cg0tpLzoiLNNRts",
};

const jwk = {
  kty: "EC",
  crv: "P-256",
  key_ops: ["sign"],
  x: uint8ArrayToBase64Url(base64ToUint8Array(vapid.publicKey).subarray(1, 33)),
  y: uint8ArrayToBase64Url(
    base64ToUint8Array(vapid.publicKey).subarray(33, 65)
  ),
  d: vapid.privateKey,
};

console.log({ jwk });

function uint8ArrayToBase64Url(uint8Array: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, uint8Array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64ToUint8Array(base64String: string) {
  const base64 = base64UrlDecodeString(base64String);
  const rawData = atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
