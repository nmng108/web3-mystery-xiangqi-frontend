import { type AddressLike, type BigNumberish, isAddress } from 'ethers';

export * from './getStatesDefaultValues';
export * from './localStorageMethods';

export const formatBalance = (rawBalance: string) => {
  const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
  return balance;
};

export const formatChainAsNum = (chainIdHex: string) => {
  const chainIdNum = parseInt(chainIdHex);
  return chainIdNum;
};

export const formatAddress = (addr: string) => {
  const upperAfterLastTwo = addr.slice(0, 2) + addr.slice(2);
  return `${upperAfterLastTwo.substring(0, 5)}...${upperAfterLastTwo.substring(39)}`;
};

export function isPositiveBigNumber(num?: BigNumberish): boolean {
  return num && BigInt(num) > 0n;
}

export function isEqual(num_0: BigNumberish, num_1: BigNumberish): boolean {
  console.assert(typeof num_0 != "undefined" && typeof num_1 != "undefined", "Both number must not be undefined");

  return (num_0 == null && num_1 == null) || ((num_0 != null) && (num_1 != null) && BigInt(num_0) == BigInt(num_1));
}
// export function isSameAddress(addr0: string, addr1: string) {
//   return addr0.toLowerCase() === addr1.toLowerCase();
// }

export function isSameAddress(addr_0: AddressLike, addr_1: AddressLike) {
  const addr_0_str: string = ((typeof addr_0 === 'string') || addr_0 instanceof Promise)
    ? addr_0.toString()
    : (addr_0 && 'getAddress' in addr_0)
      ? addr_0.getAddress().toString()
      : undefined;

  const addr_1_str: string =((typeof addr_1 === 'string') || addr_1 instanceof Promise)
    ? addr_1.toString()
    : (addr_1 && 'getAddress' in addr_1)
      ? addr_1.getAddress().toString()
      : undefined;

  return addr_0_str && addr_1_str && (addr_0_str.toLowerCase() == addr_1_str.toLowerCase());
}

export function isNonZeroAddress(address: AddressLike): boolean {
  return address && BigInt(address.toString()) != 0n && isAddress(address);
}