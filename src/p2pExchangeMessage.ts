import { type BigNumberish, type Signer } from 'ethers';
import { MysteryChineseChess } from './contracts/typechain-types';

export enum P2PMessageType {
  NONE,
  EXIT,
  START_GAME,
  PAUSE_GAME,
  SYNC,
  CHAT,
  MOVE,
  MOVE_VALIDATED_BY_PEER,
  INVALID_MESSAGE,
  INVALID_MOVE,
  INVALID_SIGNATURE,
  RESIGN,
  OFFER_DRAW,
  APPROVE_DRAW_OFFER,
  DECLINE_DRAW_OFFER,
  OPPONENT_WON_DUE_TO_SIGNATURE_VALIDATION_ERROR,
}

export interface P2PExchangeMessageInterface {
  type: P2PMessageType;
  data: ExchangeMessageData;
  /**
   * Created by signing `data` using user account's private key.
   * Almost exchanged messages require this field to ensure integrity and authenticity.<br>
   * Note that the signed data should contain something <u>unique</u>, like match ID, a nonce/random, timestamp,...<br>
   * MOVE messages don't require this property, because each element `MoveStruct` has its own array of 2 signatures.
   */
  signature?: string;
}

export interface MatchSyncMessageInterface extends P2PExchangeMessageInterface {
  type: P2PMessageType;
  data: SyncData;
  /**
   * Do not sign this array, because it's large size may cause the unexpected error "signature cannot be verified"
   */
  moves: MysteryChineseChess.MoveStruct[];
  signature: string;
}

type ExchangeMessageData =
  | MysteryChineseChess.MoveStruct
  | MysteryChineseChess.MoveStruct[]
  | SyncData
  | MessageAndTimestamp
  | ChatMessage;

// export interface MoveData {
//   details: MoveDataDetails;
//   signatures: string[]; // requires both players to sign
// }

// export interface MoveDataDetails {
//   playerIndex: number;
//   oldPosition: Position;
//   newPosition: Position;
//   datetime: Date;
// }

export interface SyncData {
  /**
   * Start from 0 by initializer
   */
  packetNum: number;
  matchId: BigNumberish;
  timestamp: number;
  /**
   * True if account has kept connected since any time in the past, before this sync process happens
   */
  hadSync: boolean;
  verifiedMoveLength?: number;
  timeControls: [number, number];
}

export interface MessageAndTimestamp {
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  sender: string;
  content: string;
  timestamp: number;
}

// export class InGameExchangeMessage<Type extends InGameMessageType, Data extends ExchangeMessageData> implements InGameExchangeMessageInterface {
//   readonly type: Type;
//   readonly data: Data;
//   readonly signature?: string;
//
//   constructor(type: Type, data: Data, signature?: string) {
//     this.type = type;
//     this.data = data;
//     this.signature = signature;
//   }
// }

// export class MoveMessage extends InGameExchangeMessage<InGameMessageType.MOVE, MysteryChineseChess.MoveStruct> {
//   constructor(data: MysteryChineseChess.MoveStruct, signature: string) {
//     super(InGameMessageType.MOVE, data, signature);
//   }
// }
//
// export class ResignMessage extends InGameExchangeMessage<InGameMessageType.RESIGN, null> {
//   constructor(data: null, signature: string) {
//     super(InGameMessageType.RESIGN, data, signature);
//   }
// }
//
// export class DrawMessage extends InGameExchangeMessage<InGameMessageType.OFFER_DRAW, null> {
//   constructor(data: null, signature: string) {
//     super(InGameMessageType.OFFER_DRAW, data, signature);
//   }
// }
//
// export class ChatMessage extends InGameExchangeMessage<InGameMessageType.CHAT, { timestamp: number, message: string }> {
//   constructor(data: { timestamp: number, message: string }) {
//     super(InGameMessageType.CHAT, data);
//   }
// }

export class InGameMessageFactory {
  private _signer: Signer;

  constructor(signer: Signer) {
    this._signer = signer;
  }

  get signer(): Signer {
    return this._signer;
  }

  set signer(value: Signer) {
    this._signer = value;
  }

  // async from<Type extends InGameMessageType, Data extends ExchangeMessageData>(
  //   messageType: Type,
  //   data: Data
  // ): Promise<InGameExchangeMessageInterface> {
  //   if (messageType == InGameMessageType.CHAT && typeof data === 'string') {
  //     return new ChatMessage(data);
  //   }
  //
  //   if (messageType == InGameMessageType.MOVE) {
  //     return new MoveMessage(
  //       data as MysteryChineseChess.MoveStruct,
  //       await this._signer.signMessage(JSON.stringify(data))
  //     );
  //   }
  // }
}

// export function sendToPeer(dataConnection: DataConnection) {
//   return new DataWithType(dataConnection);
// }
// sendToPeer(null).withType(InGameMessageType.RESIGN).data();
//
// interface DataWithTypeInterface<Type extends InGameMessageType, Data> {
//   withType(type: Type): ConnectionWithTypedData<Type, Data>;
// }
//
// interface TypeToDataInterface<Type> extends DataWithTypeInterface<InGameMessageType.MOVE, MoveMessage> {
// }
//
// class DataWithType<Type extends InGameMessageType, Data> implements DataWithTypeInterface<Type, Data> {
//   private readonly _dataConnection: DataConnection;
//
//   constructor(dataConnection: DataConnection) {
//     this._dataConnection = dataConnection;
//   }
//
//   withType(type: Type): ConnectionWithTypedData<Type, Data> {
//     return new ConnectionWithTypedData<Type, Data>(this._dataConnection, type);
//   }
//
// }
//
// class ConnectionWithTypedData <Type extends InGameMessageType, Data> {
//   private readonly dataConnection: DataConnection;
//   private readonly type: Type;
//
//   constructor(dataConnection: DataConnection, type: Type) {
//     this.dataConnection = dataConnection;
//     this.type = type;
//   }
//
//   async data(data: Data) {
//     // const sig = async (message: string | Uint8Array | object) => {
//     //   return await signer
//     //     .signMessage(typeof message == 'string' || message instanceof Uint8Array ? message : JSON.stringify(message))
//     //     .catch((err) => {
//     //       setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
//     //       throw err;
//     //     });
//     return new SendWithSigner(this.dataConnection, this.type, data)
//   }
// }
//
// class SendWithSigner<Type extends InGameMessageType, Data> {
//   private readonly _dataConnection: DataConnection;
//   private readonly _type: Type;
//   private readonly _data: Data;
//
//   constructor(dataConnection: DataConnection, type: Type, data: Data) {
//     this._dataConnection = dataConnection;
//     this._type = type;
//     this._data = data;
//   }
//
//   async pushSignedBy(signer: Signer): Promise<void> {
//     const signMessageAsync = async (message: string | Uint8Array | object | unknown) => {
//       return await signer
//         .signMessage(typeof message == 'string' || message instanceof Uint8Array ? message : JSON.stringify(message))
//         .catch((err) => {
//           // setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
//           throw err;
//         });
//     }
//
//     this._dataConnection.send({
//       type: this._type,
//       data: this._data,
//       signature: await signMessageAsync(this._data),
//     } as InGameExchangeMessageInterface)
//   }
// }

// function
