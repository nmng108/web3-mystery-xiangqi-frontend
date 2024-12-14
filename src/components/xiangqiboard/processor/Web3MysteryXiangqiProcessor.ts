import { MysteryChineseChess } from '../../../contracts/typechain-types';
import { Piece, PieceColor } from '../../../contracts/abi';
import {
  AbstractMysteryXiangqiProcessor,
  PlayerPiece,
  type NullablePlayerPiece,
  Position,
} from './xiangqiProcessor.ts';
import { type AddressLike, type Signer } from 'ethers';
import { isBlank, isNonZeroAddress, isReliableMessage } from '../../../utilities';
import { MessageAndTimestamp, P2PExchangeMessageInterface, P2PMessageType } from '../../../p2pExchangeMessage.ts';
import WalletException from '../../../exceptions/WalletException.ts';

export class Web3MysteryXiangqiProcessor extends AbstractMysteryXiangqiProcessor {
  private readonly _signer: Signer;
  private readonly _contract: MysteryChineseChess;
  private readonly _match: MysteryChineseChess.MatchStruct;
  private readonly _moves: MysteryChineseChess.MoveStruct[];
  private readonly _playerIndex: number;

  constructor(
    contract: MysteryChineseChess,
    signer: Signer,
    match: MysteryChineseChess.MatchStruct,
    playerIndex: number
  ) {
    if (!contract) {
      throw new Error('Requires non-null contract');
    }

    if (!match) {
      throw new Error('Requires non-null match');
    }

    if (![0, 1].includes(playerIndex)) {
      throw new Error('playerIndex must equal 0 or 1');
    }

    super(
      match.board.map<NullablePlayerPiece[]>((row) =>
        row.map((cell) => (cell.piece != Piece.None ? new PlayerPiece(cell) : null))
      )
    );

    this._contract = contract;
    this._signer = signer;
    this._match = match;
    this._moves = [];
    this._playerIndex = playerIndex;
  }

  getPlayerPiece(position: MysteryChineseChess.PositionStruct): NullablePlayerPiece {
    return super.getPlayerPiece({ y: Number(position.y), x: Number(position.x) });
  }

  async moveAndSign(
    oldPosition: Position | MysteryChineseChess.PositionStruct,
    newPosition: Position | MysteryChineseChess.PositionStruct,
    verifiesOpponentMove?: boolean
  ): Promise<MysteryChineseChess.MoveStruct | null> {
    const movedPlayerPiece = this.getPlayerPiece(oldPosition);
    const unfolded: boolean = movedPlayerPiece.unfolded;

    this.move(
      { y: Number(oldPosition.y), x: Number(oldPosition.x) },
      { y: Number(newPosition.y), x: Number(newPosition.x) }
    );

    if (!unfolded) {
      movedPlayerPiece.unfold(false); // hide this piece until user sends message to his peer
    }

    const moveData: MysteryChineseChess.MoveStruct = this._moves[this._moves.length - 1];

    if (this.hasWon(this._playerIndex)) {
      // Last move is not required to verify by peer but by contract
      console.log(`[processor] You won!!!!!!`);
      // try {
      //   await this._contract.verifyCheckmate(this._match.id, this._moves);
      // } catch (err) {
      //   this.revertLastMove();
      //   console.log(err);
      //   throw err;
      //   // throw new WalletException(err);
      // }
    } else {
      moveData.signatures[this._playerIndex] = await this._signer
        .signMessage(JSON.stringify(moveData.details))
        .catch((err) => {
          this.revertLastMove();
          throw new WalletException(err);
        });
    }

    movedPlayerPiece.unfold();

    return moveData;
  }

  move(oldPosition: Position, newPosition: Position): void;
  move(oldPosition: MysteryChineseChess.PositionStruct, newPosition: MysteryChineseChess.PositionStruct): void;

  move(
    oldPosition: Position | MysteryChineseChess.PositionStruct,
    newPosition: Position | MysteryChineseChess.PositionStruct
  ): void {
    super.move(
      { x: Number(oldPosition.x), y: Number(oldPosition.y) },
      { x: Number(newPosition.x), y: Number(newPosition.y) }
    );

    this._moves.push({
      details: {
        playerIndex: this._playerIndex,
        oldPosition: oldPosition,
        newPosition: newPosition,
        timestamp: Date.now(),
      },
      signatures: [null, null],
    });
  }

  // async verifyOpponentMove(moveData: MysteryChineseChess.MoveStruct): Promise<MysteryChineseChess.MoveStruct> {
  //   const moveDetails: MysteryChineseChess.MoveDetailsStruct = moveData.details;
  //   const opponentSignature: string = moveData.signatures[1 - this._playerIndex];
  //   const opponentAddress: AddressLike = this._match.players[1 - this._playerIndex];
  //
  //   // console.log("processing opponent's move");
  //   // setFullscreenToastMessage({ message: '', level: 'info', duration: 3000 });
  //
  //   if (
  //     isBlank(opponentSignature) ||
  //     !isReliableMessage(moveDetails, opponentSignature, opponentAddress)
  //   ) {
  //     const response: MessageAndTimestamp = { message: 'Signature is not verified', timestamp: Date.now() };
  //
  //     err.message = {
  //       type: P2PMessageType.INVALID_SIGNATURE,
  //       data: response,
  //       signature: await signMessageAsync(response),
  //     } as P2PExchangeMessageInterface;
  //   )
  //     ;
  //
  //     return;
  //   } else if (Date.now() - Number(moveDetails.timestamp) > Number(this._match.timeControl)) {
  //     const response = { message: 'Invalid timestamp', timestamp: Date.now() };
  //
  //     opponentConnection.send({
  //       type: P2PMessageType.INVALID_MOVE,
  //       data: response,
  //       signature: await signMessageAsync(response),
  //     } as P2PExchangeMessageInterface);
  //
  //     return;
  //   }
  //
  //   const movedPlayerPiece = this.getPlayerPiece(moveDetails.oldPosition);
  //   const playerIndex: number = movedPlayerPiece.color;
  //
  //   super.move(
  //     { y: Number(oldPosition.y), x: Number(oldPosition.x) },
  //     { y: Number(newPosition.y), x: Number(newPosition.x) },
  //   );
  //   // TODO: differentiate invalid move and exception caused by signing when opponent executes this method to verify your move.
  //   //  If being a invalid move, call contract to verify win result.
  //   //  If being a signing exception, send draw result or require opponent to remake a move.
  //
  //   movedPlayerPiece.unfold(false); // hide this until user sends message to his peer
  //
  //   // Send the move to opponent
  //   const moveDataDetails: MysteryChineseChess.MoveDetailsStruct = {
  //     playerIndex: playerIndex,
  //     oldPosition: oldPosition,
  //     newPosition: newPosition,
  //     timestamp: Date.now(),
  //   };
  //   this._moves.push(moveData);
  //
  //
  //   if (this.hasWon(playerIndex)) {
  //     // Last move is not required to verify by peer but by contract
  //     console.log(`[processor] ${playerIndex} won!!!!!!`);
  //     this._contract.verifyCheckmate(this._match.id, this._moves);
  //   } else {
  //     moveData.signatures[1 - playerIndex] = await this._signer.signMessage(JSON.stringify(moveDataDetails)).catch((err) => {
  //       this.revertLastMove();
  //
  //       throw err;
  //     });
  //   }
  //
  //   return moveData;
  //
  // }
}
