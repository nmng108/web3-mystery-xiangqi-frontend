import { Processor } from 'postcss';
import { Piece, PieceColor } from '../../constants';

export interface Position {
  x: number;
  y: number;
}

export interface XiangqiProcessor {
  get2DArrayBoard(): PlayerPiece[][];

  initBoard(): void;

  resetBoard(): void;

  move(oldPosition: Position, newPosition: Position): void;

  hasBlackWon(): boolean;

  hasRedWon(): boolean;

  draws(): boolean;
}

type NullablePlayerPiece = PlayerPiece | null;

export class DefaultXiangqiProcessor implements XiangqiProcessor {
  private readonly _board: NullablePlayerPiece[][];

  constructor() {
    this._board = Array.from(
      { length: 10 }, (v, idx): NullablePlayerPiece[] => {
        switch (idx) {
          case 0:
            return [
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.General, true),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
            ];
          case 2: {
            const arr = [
              null,
              null,
              null,
              null,
              null,
              null,
              null,
              null,
            ];

            arr[1] = new PlayerPiece(PieceColor.RED, Piece.Advisor, false);
            arr[7] = new PlayerPiece(PieceColor.RED, Piece.Advisor, false);

            return arr;
          }
          case 3:
            return [
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.RED, Piece.Advisor, false),
            ];
          case 9:
            return [
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.General, true),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
            ];
          case 7:
            return [
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
              null,
              null,
              null,
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
            ];
          case 6:
            return [
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
              null,
              new PlayerPiece(PieceColor.BLACK, Piece.Advisor, false),
            ];
        }

        return Array.from({ length: 9 }, () => null);
      }
    ) as NullablePlayerPiece[][];
  }

  draws(): boolean {
    return false;
  }

  public get2DArrayBoard(): PlayerPiece[][] {
    return this._board;
  }

  hasBlackWon(): boolean {
    return false;
  }

  hasRedWon(): boolean {
    return false;
  }

  initBoard(): void {
  }

  public move(oldPosition: Position, newPosition: Position): void {
    this._board[newPosition.y][newPosition.x] = this._board[oldPosition.y][oldPosition.x];
    this._board[oldPosition.y][oldPosition.x] = null;
  }

  resetBoard(): void {
  }
}

export class PlayerPiece {
  private readonly _color: PieceColor; // either RED (0) or BLACK (1)
  private readonly _piece: Piece;
  private _unfolded: boolean; // 2 purposes: (1) identify if a piece has moved or not and (2) decide the rule of its next move will comply with the rule of which Piece

  constructor(color: PieceColor, piece: Piece, unfolded: boolean) {
    this._color = color;
    this._piece = piece;
    this._unfolded = unfolded;
  }

  get color(): PieceColor {
    return this._color;
  }

  get piece(): Piece {
    return this._piece;
  }

  get unfolded(): boolean {
    return this._unfolded;
  }

  unfold(value: boolean): void {
    this._unfolded = true;
  }
}

export default XiangqiProcessor;
// export { Processor, DefaultProcessor };