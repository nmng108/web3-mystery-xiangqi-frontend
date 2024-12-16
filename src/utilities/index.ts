import { type AddressLike, type BigNumberish, isAddress, type SignatureLike, verifyMessage } from 'ethers';
import { PieceColor } from '../contracts/abi';
import { MysteryChineseChess } from '../contracts/typechain-types';
import { Web3MysteryXiangqiProcessor } from '../components/xiangqiboard/processor';

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

/**
 * `null` and `undefined` are taken into account and returns `true`.
 * @param str
 */
export function isEmpty(str: string): boolean {
  return !str || str.length > 0;
}

/**
 * `null` and `undefined` are taken into account and returns `false`.
 * @param str
 */
export function isNotEmpty(str: string): boolean {
  return !isEmpty(str);
}

/**
 * `null` and `undefined` are taken into account and returns `true`.
 * @param str
 */
export function isBlank(str: string): boolean {
  return !str || str.trim().length == 0;
}

/**
 * `null` and `undefined` are taken into account and returns `false`.
 * @param str
 */
export function isNotBlank(str: string): boolean {
  return !isBlank(str);
}

export function isPositiveBigNumber(num?: BigNumberish): boolean {
  return num && BigInt(num) > 0n;
}

export function isEqual(num_0: BigNumberish, num_1: BigNumberish): boolean {
  // console.assert(typeof num_0 != 'undefined' && typeof num_1 != 'undefined', 'Both number must not be undefined');
  if (!(typeof num_0 != 'undefined' && typeof num_1 != 'undefined')) throw new Error('both numbers are undefined');
  return (num_0 == null && num_1 == null) || (num_0 != null && num_1 != null && BigInt(num_0) == BigInt(num_1));
}

// export function isSameAddress(addr0: string, addr1: string) {
//   return addr0.toLowerCase() === addr1.toLowerCase();
// }

export function isSameAddress(addr_0: AddressLike, addr_1: AddressLike) {
  const addr_0_str: string =
    typeof addr_0 === 'string' || addr_0 instanceof Promise
      ? addr_0.toString()
      : addr_0 && 'getAddress' in addr_0
        ? addr_0.getAddress().toString()
        : undefined;

  const addr_1_str: string =
    typeof addr_1 === 'string' || addr_1 instanceof Promise
      ? addr_1.toString()
      : addr_1 && 'getAddress' in addr_1
        ? addr_1.getAddress().toString()
        : undefined;

  return addr_0_str && addr_1_str && addr_0_str.toLowerCase() == addr_1_str.toLowerCase();
}

export function isZeroAddress(address: AddressLike): boolean {
  return !address || BigInt(address.toString()) == 0n || !isAddress(address);
}

export function isNonZeroAddress(address: AddressLike): boolean {
  return !isZeroAddress(address);
}

export function isReliableMessage(
  message: string | Uint8Array | object,
  signature: SignatureLike,
  address: AddressLike
): boolean {
  return (
    verifyMessage(
      typeof message == 'string' || message instanceof Uint8Array ? message : JSON.stringify(message),
      signature
    ).toLowerCase() == address.toString().toLowerCase()
  );
}

/**
 * May useful in certain cases.
 */
export function getShortErrorMessage(
  err: {
    message: string;
  } & (
    | {
        info: { error: { message: string } };
      }
    | {
        error: { message: string };
      }
  )
): string {
  let message: string = err.message;

  if ('code' in err && 'info' in err && 'error' in err.info && 'message' in err.info.error) {
    message = err.info.error.message;
  } else if ('code' in err && 'error' in err && 'message' in err.error) {
    message = err.error.message;
    // console.log('keys: ', Object.keys(err).forEach(k => console.log(k, ' - ', err[k])));
  }

  return message;
}

export function verifyAndMakeProvidedMoves(
  moves: MysteryChineseChess.MoveStruct[],
  processor: Web3MysteryXiangqiProcessor,
  playerAddresses: [AddressLike, AddressLike]
) {
  let maxVerifiedMoveLength: number = 0;

  for (let mvIdx = 0; mvIdx < moves.length; mvIdx++) {
    const move = moves[mvIdx];
    let areBothValidSignatures: boolean = true;

    for (let sigIdx = 0; sigIdx < move.signatures.length; sigIdx++) {
      if (
        !move.signatures[sigIdx] ||
        !isReliableMessage(move.details, move.signatures[sigIdx], playerAddresses[sigIdx])
      ) {
        areBothValidSignatures = false;
        console.error('[verifyMoves] invalid signature:', sigIdx, move.signatures[sigIdx]);
        break;
      }
    }

    if (!areBothValidSignatures) break;

    try {
      processor.move(move.details.oldPosition, move.details.newPosition);
    } catch (err) {
      console.error('[verifyMoves] ', err.message);
      break;
    }

    maxVerifiedMoveLength += 1;
  }

  return moves.slice(0, maxVerifiedMoveLength);
}

export function computeRemainingTimeControls(
  moves: MysteryChineseChess.MoveStruct[],
  originalTimeControl: BigNumberish,
  startTimestamp: BigNumberish,
  latestTimestamp?: BigNumberish
): [number, number] {
  const totalConsumedTimeControls: [number, number] = [0, 0]; // each element corresponds to each player with the same index

  for (let mvIdx = 0; mvIdx < moves.length; mvIdx++) {
    const move = moves[mvIdx];
    const playerIndex = Number(move.details.playerIndex);
    const moveTimestamp = Number(move.details.timestamp);
    // Compute remaining time controls

    if (playerIndex == PieceColor.RED) {
      // 0
      if (mvIdx == 0) {
        totalConsumedTimeControls[playerIndex] += moveTimestamp - Number(startTimestamp) * 1000;
      } else if (mvIdx % 2 == 0) {
        totalConsumedTimeControls[playerIndex] += moveTimestamp - Number(moves[mvIdx - 1].details.timestamp);
      }
    } else if (playerIndex == PieceColor.BLACK && mvIdx % 2 == 1) {
      // 1
      totalConsumedTimeControls[playerIndex] += moveTimestamp - Number(moves[mvIdx - 1].details.timestamp);
    }
  }

  if (moves.length > 0) {
    const lastMoveDetails = moves[moves.length - 1].details;
    totalConsumedTimeControls[1 - Number(lastMoveDetails.playerIndex)] +=
      Number(latestTimestamp !== undefined ? latestTimestamp : Date.now()) - Number(lastMoveDetails.timestamp);
  } else {
    totalConsumedTimeControls[PieceColor.RED] +=
      Number(latestTimestamp !== undefined ? latestTimestamp : Date.now()) - Number(startTimestamp);
  }

  return [
    Number(originalTimeControl) - totalConsumedTimeControls[0],
    Number(originalTimeControl) - totalConsumedTimeControls[1],
  ];
}
