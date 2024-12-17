/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  VITE_CONTRACT_ADDRESS: string;
  VITE_CHAIN_ID: number;
  VITE_PEER_SERVER_HOST: string;
  VITE_PEER_SERVER_PORT: number;
  VITE_PEER_SERVER_PATH: string;
  VITE_PEER_SERVER_SECURE: boolean; // SSL
  VITE_PEER_SERVER_KEY: string | undefined;
  VITE_PEER_SERVER_PING_INTERVAL: number; // unit: millisecond
  VITE_PEER_SERVER_DEBUG: 0 | 1 | 2 | 3;
}

declare global {
  namespace React {}

  // namespace NodeJS {
  //   interface ProcessEnv {
  //   }
  // }

  interface WindowEventMap {
    'eip6963:announceProvider': CustomEvent;
  }

  interface Window {
    //adds definition to Document, but you can do the same with HTMLElement
    addEventListener<K extends keyof WindowEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventMap[K]) => void
    ): void;

    dispatchEvent<K extends keyof WindowEventMap>(ev: WindowEventMap[K]): void;

    removeEventListener<K extends keyof WindowEventMap>(
      type: K,
      listener: (this: Window, ev: WindowEventMap[K]) => void
    ): void;
  }
}

// Describes metadata related to a provider based on EIP-6963.
interface EIP6963ProviderInfo {
  rdns: string;
  uuid: string;
  name: string;
  icon: string;
}

// Represents the structure of a provider based on EIP-1193.
interface EIP1193Provider {
  isStatus?: boolean;
  host?: string;
  path?: string;
  sendAsync?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  send?: (
    request: { method: string; params?: Array<unknown> },
    callback: (error: Error | null, response: unknown) => void
  ) => void;
  request: (request: { method: ProviderRequestMethod; params?: Array<unknown> }) => Promise<unknown>;

  /**
   * Fired when the user's accounts change.
   * @param event
   * @param listener - Callback that receives the updated accounts array.
   */
  on(event: 'accountsChanged', listener: ([newAccount, oldAccount]: string[]) => void): void;

  /**
   * Fired when the active chain changes (e.g., switching networks in the wallet).
   * @param event
   * @param listener - Callback that receives the new chain ID as a string.
   */
  on(event: 'chainChanged', listener: (chainId: number) => void): void;

  /**
   * Fired when the connection status to the Ethereum network changes.
   * @param event
   * @param listener - Callback that receives a connection info object.
   */
  on(event: 'connect', listener: (info: { chainId: string }) => void): void;

  /**
   * Fired when the provider disconnects from the Ethereum network.
   * @param event
   * @param listener - Callback that receives a provider-disconnection error object.
   */
  on(event: 'disconnect', listener: (error: { code: number; message: string }) => void): void;

  /**
   * MetaMask-specific: Fired when permissions change.
   * @param event
   * @param listener - Callback that receives an array of permission objects.
   */
  on(event: 'message', listener: (message: ProviderMessage) => void): void;

  /**
   * Fired when a subscription event occurs (e.g., logs, new blocks).
   * @param event
   * @param listener - Callback that receives the subscription data.
   */
  on(event: 'data', listener: (data: ProviderSubscriptionData) => void): void;

  /**
   * Unsubscribe from a specific event type.
   * @param event - The name of the event.
   * @param listener - The previously registered listener.
   */
  removeListener(event: EthereumProviderEvent, listener: (...args: never[]) => void): void;

  /**
   * Remove all listeners for a specific event type.
   * @param event - The name of the event.
   */
  removeAllListeners(event?: EthereumProviderEvent): void;

  // removeListener: (event: ProviderEvent, handler: () => void) => void;
  isConnected: () => boolean; // true if the provider is connected to the current chain, false otherwise.
}

// Combines the provider's metadata with an actual provider object, creating a complete picture of a
// wallet provider at a glance.
interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

// Represents the structure of an event dispatched by a wallet to announce its presence based on EIP-6963.
type EIP6963AnnounceProviderEvent = Event & {
  detail: {
    info: EIP6963ProviderInfo;
    provider: Readonly<EIP1193Provider>;
  };
};

// An error object with optional properties, commonly encountered when handling eth_requestAccounts errors.
interface WalletError {
  code?: string;
  message?: string;
  info?: {
    error: {
      code: number;
      message: string;
    };
  };
}

type EthereumProviderEvent =
  | 'accountsChanged' // Fired when wallet accounts change
  | 'chainChanged' // Fired when the active chain/network changes
  | 'connect' // Fired when the provider connects to the network
  | 'disconnect' // Fired when the provider disconnects
  | 'message' // Fired for provider-specific messages
  | 'data'; // Fired for subscription events (logs, blocks, etc.)

interface ProviderMessage {
  type: string; // The type of message (e.g., "eth_subscription")
  data: unknown; // Additional data relevant to the message
}

interface ProviderSubscriptionData {
  subscription: string; // Subscription ID
  result: unknown; // Result data, depends on the subscription type
}

type ProviderRequestMethod =
  // Ethereum Accounts
  | 'eth_accounts' // Get all connected accounts
  | 'eth_requestAccounts' // Request account access

  // Blockchain Information
  | 'eth_chainId' // Get current chain ID
  | 'net_version' // Get network version
  | 'eth_blockNumber' // Get the latest block number
  | 'eth_getBlockByHash' // Get block by hash
  | 'eth_getBlockByNumber' // Get block by number
  | 'eth_getBlockTransactionCountByHash' // Get transaction count for a block by hash
  | 'eth_getBlockTransactionCountByNumber' // Get transaction count for a block by number
  | 'eth_getCode' // Get the contract code at a specific address
  | 'eth_getStorageAt' // Get storage data at a specific position for an address
  | 'eth_getLogs' // Get logs based on filter options

  // Account and Signing
  | 'eth_sign' // Sign arbitrary data
  | 'personal_sign' // Sign data with a personal message prefix
  | 'eth_signTypedData' // Sign typed data (EIP-712, legacy)
  | 'eth_signTypedData_v4' // Sign typed data (EIP-712, version 4)

  // Transactions
  | 'eth_sendTransaction' // Send a transaction (requires user confirmation)
  | 'eth_sendRawTransaction' // Send a raw, signed transaction
  | 'eth_getTransactionByHash' // Get transaction details by hash
  | 'eth_getTransactionReceipt' // Get the receipt for a transaction
  | 'eth_getTransactionCount' // Get the number of transactions sent from an address (nonce)

  // Smart Contract Calls
  | 'eth_call' // Call a contract method (read-only, no state changes)
  | 'eth_estimateGas' // Estimate gas required for a transaction
  | 'eth_getBalance' // Get the balance of an address
  | 'eth_getTransactionByBlockHashAndIndex' // Get transaction by block hash and index
  | 'eth_getTransactionByBlockNumberAndIndex' // Get transaction by block number and index

  // Gas Pricing
  | 'eth_gasPrice' // Get the current gas price
  | 'eth_maxPriorityFeePerGas' // Get the max priority fee for EIP-1559 transactions

  // Wallet Management
  | 'wallet_addEthereumChain' // Add a new network (EIP-3085)
  | 'wallet_switchEthereumChain' // Switch to an existing network (EIP-3326)
  | 'wallet_watchAsset' // Watch an asset (e.g., token) in the wallet (EIP-747)
  | 'wallet_revokePermissions' //

  // Filters (deprecated in some cases)
  | 'eth_newFilter' // Create a new filter object
  | 'eth_newBlockFilter' // Create a new block filter
  | 'eth_newPendingTransactionFilter' // Create a filter for pending transactions
  | 'eth_uninstallFilter' // Remove a filter object
  | 'eth_getFilterChanges' // Get filter changes (polling)
  | 'eth_getFilterLogs' // Get all logs for a filter

  // Debugging and Tracing
  | 'debug_traceTransaction' // Debug a transaction (requires RPC with debugging enabled)

  // Ethereum Node Information
  | 'web3_clientVersion' // Get the client version of the Ethereum node
  | 'web3_sha3' // Hash data using Keccak256

  // Custom Methods Specific to MetaMask
  | 'wallet_requestPermissions' // Request wallet-specific permissions
  | 'wallet_getPermissions' // Get current wallet-specific permissions
  | 'wallet_registerOnboarding' // Start onboarding a user (MetaMask-specific)
  | 'wallet_snap' // MetaMask Snap API (for extensions)

  // Other
  | 'eth_subscribe' // Subscribe to events (e.g., new blocks, logs)
  | 'eth_unsubscribe'; // Unsubscribe from events
