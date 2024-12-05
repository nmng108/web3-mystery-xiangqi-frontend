export const CONTRACT_ADDRESS: string =
  import.meta.env.CONTRACT_ADDRESS || '0x446C29FBFEF829F81E236a2376191F648dbEF995';
export const CHAIN_ID: number = import.meta.env.CHAIN_ID ?? 1337;

export enum ContractError {
  Unauthorized = 'Unauthorized',
  ResourceNotFound = 'ResourceNotFound',
  InvalidAction = 'InvalidAction',
}
