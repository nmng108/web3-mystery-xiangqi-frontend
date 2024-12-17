// This file is supposed to shorten usages of env variables by omitting "import.meta.env.VITE_"

export const CONTRACT_ADDRESS: string =
  import.meta.env.VITE_CONTRACT_ADDRESS || '0xD89c1432EaA169C54dC7610C744c68a2F4b6B3e5';
export const CHAIN_ID: number = import.meta.env.VITE_CHAIN_ID || 1337;
export const PEER_SERVER_HOST: string = import.meta.env.VITE_PEER_SERVER_HOST || '127.0.0.1';
export const PEER_SERVER_PORT: number = import.meta.env.VITE_PEER_SERVER_PORT || 9000;
export const PEER_SERVER_PATH: string = import.meta.env.VITE_PEER_SERVER_PATH || '/';
export const PEER_SERVER_SECURE: boolean = import.meta.env.VITE_PEER_SERVER_SECURE; // TLS
export const PEER_SERVER_KEY: string | undefined = import.meta.env.VITE_PEER_SERVER_KEY; // access key
export const PEER_SERVER_PING_INTERVAL: number = import.meta.env.VITE_PEER_SERVER_PING_INTERVAL; // unit: millisecond
export const PEER_SERVER_DEBUG: 0 | 1 | 2 | 3 = import.meta.env.VITE_PEER_SERVER_DEBUG ?? 1;

const env = {
  CONTRACT_ADDRESS,
  CHAIN_ID,
  PEER_SERVER_HOST,
  PEER_SERVER_PORT,
  PEER_SERVER_PATH,
  PEER_SERVER_SECURE,
  PEER_SERVER_KEY,
  PEER_SERVER_PING_INTERVAL,
  PEER_SERVER_DEBUG,
};

export default env;
