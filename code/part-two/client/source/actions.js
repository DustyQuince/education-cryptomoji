import { createPrivateKey } from "./services/signing.js";

export const usePrivateKey = pk => {
  window.sessionStorage.setItem("user_priv_key", pk);
  return { type: "USE_PRIVATE_KEY", privateKey: pk };
};

export const generateKey = () => {
  const pk = createPrivateKey();
  window.sessionStorage.setItem("user_priv_key", pk);
  return { type: "USE_PRIVATE_KEY", privateKey: pk };
};

export const deleteKey = () => {
  window.sessionStorage.removeItem("user_priv_key");
  return { type: "USE_PRIVATE_KEY", privateKey: null };
};

// export { usePrivateKey, generateKey, deleteKey };
