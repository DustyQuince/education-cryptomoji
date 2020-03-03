import { createPrivateKey } from "./services/signing.js";

export const usePrivateKey = pk => {
  return { type: "USE_PRIVATE_KEY", privateKey: pk };
};

export const generateKey = () => {
  return { type: "USE_PRIVATE_KEY", privateKey: createPrivateKey() };
};
