export const CONTRACT_ADDRESS: string =
  import.meta.env.CONTRACT_ADDRESS || '0x8fFbf6bED8E989688A9BF15203697F87CB63Dd2A';
export const CHAIN_ID: number = import.meta.env.CHAIN_ID ?? 1337;
export const PEER_SERVER_HOST: string = import.meta.env.PEER_SERVER_HOST ?? '192.168.0.101';
export const PEER_SERVER_PORT: number = import.meta.env.PEER_SERVER_PORT ?? 9000;
export const PEER_SERVER_PATH: string = import.meta.env.PEER_SERVER_PATH ?? '/';
export const PEER_SERVER_SECURE: boolean = import.meta.env.PEER_SERVER_SECURE; // TLS
export const PEER_SERVER_KEY: string | undefined = import.meta.env.PEER_SERVER_KEY; // access key
export const PEER_SERVER_PING_INTERVAL: number = import.meta.env.PEER_SERVER_PING_INTERVAL; // unit: millisecond
export const PEER_SERVER_DEBUG: 0 | 1 | 2 | 3 = import.meta.env.PEER_SERVER_DEBUG ?? 1;

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
