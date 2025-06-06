import { Piece, PieceColor } from '../../../contracts/abi';
import { MysteryChineseChess } from '../../../contracts/typechain-types';
import InvalidMoveError from '../../../exceptions/InvalidMoveError.ts';

export interface XiangqiProcessor {
  getBoard(): NullablePlayerPiece[][];

  initBoard(): void;

  resetBoard(): void;

  getPlayerPiece(position: Position): NullablePlayerPiece;

  move(oldPosition: Position, newPosition: Position): unknown;

  getValidMoves(position: Position): Position[];

  hasWon(pieceColor: PieceColor): boolean;

  draws(): boolean;

  getHistory(): HistoryRecord[];

  getLatestHistoryRecord(): HistoryRecord;

  revertLastMove(): void;
}

export abstract class AbstractMysteryXiangqiProcessor implements XiangqiProcessor {
  private static readonly originalAdvisorPositions: Position[] = [
    { y: 0, x: 3 },
    { y: 0, x: 5 },
    { y: 9, x: 3 },
    { y: 9, x: 5 },
  ];
  private static readonly originalElephantPositions: Position[] = [
    { y: 0, x: 2 },
    { y: 0, x: 6 },
    { y: 9, x: 2 },
    { y: 9, x: 6 },
  ];
  private static readonly originalHorsePositions: Position[] = [
    { y: 0, x: 1 },
    { y: 0, x: 7 },
    { y: 9, x: 1 },
    { y: 9, x: 7 },
  ];
  private static readonly originalChariotPositions: Position[] = [
    { y: 0, x: 0 },
    { y: 0, x: 8 },
    { y: 9, x: 0 },
    { y: 9, x: 8 },
  ];
  private static readonly originalCannonPositions: Position[] = [
    { y: 2, x: 1 },
    { y: 2, x: 7 },
    { y: 7, x: 1 },
    { y: 7, x: 7 },
  ];
  private static readonly originalSoldierPositions: Position[] = [
    { y: 3, x: 0 },
    { y: 3, x: 2 },
    { y: 3, x: 4 },
    { y: 3, x: 6 },
    { y: 3, x: 8 },
    { y: 6, x: 0 },
    { y: 6, x: 2 },
    { y: 6, x: 4 },
    { y: 6, x: 6 },
    { y: 6, x: 8 },
  ];

  /**
   * Store a separate original board copied from the board passed into the constructor.<br>
   * Used to reassign to `this._board` in `resetBoard()`, therefore do not interact directly with this array.
   * @protected
   */
  protected readonly _originalBoard: NullablePlayerPiece[][];
  protected _board: NullablePlayerPiece[][];
  protected _history: HistoryRecord[];
  private _result: CompetetionResult;

  protected constructor(board: NullablePlayerPiece[][]) {
    this._board = board;
    this._history = [];
    this._result = CompetetionResult.None;
    this._originalBoard = [];

    board.forEach((row) => this._originalBoard.push(row.map(PlayerPiece.clone)));
  }

  getBoard(): NullablePlayerPiece[][] {
    return this._board;
  }

  initBoard(): void {
    this._board = Array.from({ length: 10 }, (v, idx): NullablePlayerPiece[] => {
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
          const arr = [null, null, null, null, null, null, null, null];

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
    }) as NullablePlayerPiece[][];
  }

  resetBoard(): void {
    this._board = [];
    this._originalBoard.forEach((row) => this._board.push(row.map(PlayerPiece.clone)));
    this._history = [];
    this._result = CompetetionResult.None;
  }

  getPlayerPiece(position: Position): NullablePlayerPiece {
    return this._board[position.y][position.x];
  }

  move(oldPosition: Position, newPosition: Position): unknown {
    const oldIntPosition: Position = { y: oldPosition.y, x: oldPosition.x };
    const newIntPosition: Position = { y: newPosition.y, x: newPosition.x };

    const selectedPlayerPiece = this.getPlayerPiece(oldIntPosition);
    const targetPlayerPiece = this.getPlayerPiece(newPosition);

    if (!selectedPlayerPiece) {
      throw new InvalidMoveError('Invalid move. Cannot detect selected piece in board');
    }

    if (oldIntPosition.x == newIntPosition.x && oldIntPosition.y == newIntPosition.y) {
      throw new InvalidMoveError('Invalid move. Cannot re-select old position.');
    }

    const newPositionPlayerPiece = this._board[newIntPosition.y][newIntPosition.x];

    if (newPositionPlayerPiece && selectedPlayerPiece.color == newPositionPlayerPiece.color) {
      throw new InvalidMoveError('Invalid move. New position has our piece');
    }

    if (!this.isValidMove(oldIntPosition, newIntPosition)) {
      throw new InvalidMoveError('Invalid move');
    }

    this._history.push({
      sourcePlayerPiece: this._board[oldIntPosition.y][oldIntPosition.x].clone(),
      targetPlayerPiece: this._board[newIntPosition.y][newIntPosition.x]?.clone(),
      oldPosition: oldIntPosition,
      newPosition: newIntPosition,
    });

    this._board[newIntPosition.y][newIntPosition.x] = selectedPlayerPiece;
    this._board[oldIntPosition.y][oldIntPosition.x] = null;

    // Put this code in the same level of the call to this function
    if (!selectedPlayerPiece.unfolded) {
      selectedPlayerPiece.unfold();
    }
    console.log(targetPlayerPiece?.piece == Piece.General);
    if (targetPlayerPiece?.piece == Piece.General) {
      this._result = selectedPlayerPiece.color.valueOf();
    }

    return;
  }

  getValidMoves(position: Position): Position[] {
    const playerPiece = this._board[position.y][position.x];

    // Return an empty array if there is no piece at the given position
    if (!playerPiece) return [];

    const validMoves: Position[] = [];

    // Iterate over all possible positions on the board
    for (let y = 0; y < this._board.length; y++) {
      for (let x = 0; x < this._board[y].length; x++) {
        const newPosition: Position = { x, y };

        if (this.isValidMove(position, newPosition)) {
          validMoves.push(newPosition);
        }
      }
    }

    return validMoves;
  }

  private isValidMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const piece: Piece = playerPiece.unfolded
      ? playerPiece.piece
      : AbstractMysteryXiangqiProcessor.identifyNonGeneralOriginalPiece(oldPosition);

    switch (piece) {
      case Piece.General:
        return this.isValidGeneralMove(oldPosition, newPosition);
      case Piece.Advisor:
        return this.isValidAdvisorMove(oldPosition, newPosition, playerPiece.unfolded);
      case Piece.Elephant:
        return this.isValidElephantMove(oldPosition, newPosition);
      case Piece.Horse:
        return this.isValidHorseMove(oldPosition, newPosition);
      case Piece.Chariot:
        return this.isValidChariotMove(oldPosition, newPosition);
      case Piece.Cannon:
        return this.isValidCannonMove(oldPosition, newPosition);
      case Piece.Soldier:
        return this.isValidSoldierMove(oldPosition, newPosition);
    }

    return false;
  }

  private isValidGeneralMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.General) return false;

    const dx = Math.abs(newPosition.x - oldPosition.x);
    const dy = Math.abs(newPosition.y - oldPosition.y);

    // Check if the move is exactly one step horizontally or vertically
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      // Define palace boundaries based on piece color
      const inPalace = (x: number, y: number, color: PieceColor): boolean =>
        x >= 3 &&
        x <= 5 &&
        ((color === PieceColor.RED && y >= 0 && y <= 2) || (color === PieceColor.BLACK && y >= 7 && y <= 9));

      // Ensure the move stays within the palace
      return (
        inPalace(newPosition.x, newPosition.y, playerPiece.color) &&
        (newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color)
      );
    }

    return false;
  }

  private isValidAdvisorMove(oldPosition: Position, newPosition: Position, unfolded: boolean): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Advisor) return false;

    const dx = Math.abs(newPosition.x - oldPosition.x);
    const dy = Math.abs(newPosition.y - oldPosition.y);

    // Check if the move is exactly one step diagonally
    if (dx === 1 && dy === 1) {
      if (!unfolded && (newPosition.x < 3 || newPosition.x > 5)) {
        return false;
      }

      return newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color;
    }

    return false;
  }

  private isValidElephantMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Elephant) return false;

    const dx = Math.abs(newPosition.x - oldPosition.x);
    const dy = Math.abs(newPosition.y - oldPosition.y);

    // Check if the move is exactly two steps diagonally
    if (dx === 2 && dy === 2) {
      // Ensure the path is not blocked
      const midX = (oldPosition.x + newPosition.x) / 2;
      const midY = (oldPosition.y + newPosition.y) / 2;

      return (
        this._board[midY][midX] === null &&
        (newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color)
      );
    }

    return false;
  }

  private isValidHorseMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Horse) return false;

    const dx = Math.abs(newPosition.x - oldPosition.x);
    const dy = Math.abs(newPosition.y - oldPosition.y);

    // Check for "L" shape movement
    if ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) {
      // Determine the "leg" position
      const legX = dx === 2 ? (oldPosition.x + newPosition.x) / 2 : oldPosition.x;
      const legY = dy === 2 ? (oldPosition.y + newPosition.y) / 2 : oldPosition.y;

      // Ensure the "leg" is not blocked
      return (
        this._board[legY][legX] === null &&
        // Ensure the destination is either empty or occupied by an opponent's piece
        (newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color)
      );
    }

    return false;
  }

  private isValidChariotMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Chariot) return false;

    const dx = newPosition.x - oldPosition.x;
    const dy = newPosition.y - oldPosition.y;

    // Ensure the move is either horizontal or vertical
    if ((dx === 0 && dy !== 0) || (dx !== 0 && dy === 0)) {
      const stepX = dx === 0 ? 0 : dx / Math.abs(dx); // Step direction in x
      const stepY = dy === 0 ? 0 : dy / Math.abs(dy); // Step direction in y

      let x = oldPosition.x + stepX;
      let y = oldPosition.y + stepY;

      // Check if the path is clear
      while (x !== newPosition.x || y !== newPosition.y) {
        // Path is blocked
        if (this._board[y][x] !== null) {
          return false;
        }

        x += stepX;
        y += stepY;
      }

      // Ensure the destination is either empty or occupied by an opponent's piece
      return newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color;
    }

    return false;
  }

  private isValidCannonMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Cannon) return false;

    const dx = newPosition.x - oldPosition.x;
    const dy = newPosition.y - oldPosition.y;

    // Ensure the move is either horizontal or vertical
    if ((dx === 0 && dy !== 0) || (dx !== 0 && dy === 0)) {
      const stepX = dx === 0 ? 0 : dx / Math.abs(dx); // Step direction in x
      const stepY = dy === 0 ? 0 : dy / Math.abs(dy); // Step direction in y

      let x = oldPosition.x + stepX;
      let y = oldPosition.y + stepY;

      let screenCount = 0;

      // Traverse the path
      while (x !== newPosition.x || y !== newPosition.y) {
        if (this._board[y][x] !== null) {
          screenCount++;
        }
        x += stepX;
        y += stepY;
      }

      // Case 1: Move without capturing (path must be clear)
      if (newPositionPlayerPiece === null && screenCount === 0) {
        return true;
      }

      // Case 2: Capture (must jump exactly one screen)
      if (newPositionPlayerPiece !== null && newPositionPlayerPiece.color !== playerPiece.color && screenCount === 1) {
        return true;
      }
    }

    return false;
  }

  private isValidSoldierMove(oldPosition: Position, newPosition: Position): boolean {
    const playerPiece = this._board[oldPosition.y][oldPosition.x];
    const newPositionPlayerPiece = this._board[newPosition.y][newPosition.x];

    // Validate positions contain a piece
    // if (!playerPiece || playerPiece.piece !== Piece.Soldier) return false;

    const dx = Math.abs(newPosition.x - oldPosition.x);
    const dy = newPosition.y - oldPosition.y;

    // Determine direction based on color
    const isRed = playerPiece.color === PieceColor.RED;
    const forwardDirection = isRed ? 1 : -1; // RED moves +1, BLACK moves -1

    // Case 1: Forward move
    if (dx === 0 && dy === forwardDirection) {
      // Ensure the destination is either empty or occupied by an opponent's piece
      if (newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color) {
        return true;
      }
    }

    // Case 2: Sideways move (only after crossing the river)
    const crossedRiver = isRed ? oldPosition.y >= 5 : oldPosition.y <= 4;

    if (crossedRiver && dx === 1 && dy === 0) {
      // Ensure the destination is either empty or occupied by an opponent's piece
      if (newPositionPlayerPiece === null || newPositionPlayerPiece.color !== playerPiece.color) {
        return true;
      }
    }

    return false;
  }

  hasWon(pieceColor: PieceColor.RED | PieceColor.BLACK | number): boolean {
    return pieceColor.valueOf() == this._result.valueOf();
  }

  draws(): boolean {
    return this._result == CompetetionResult.Draw;
  }

  getHistory(): HistoryRecord[] {
    return this._history;
  }

  getLatestHistoryRecord(): HistoryRecord {
    return this._history.length > 0 ? this._history[this._history.length - 1] : null;
  }

  revertLastMove(): void {
    if (this._history.length == 0) return;

    const lastHistoryRecord = this._history[this._history.length - 1];

    this._board[lastHistoryRecord.oldPosition.y][lastHistoryRecord.oldPosition.x] = lastHistoryRecord.sourcePlayerPiece;
    this._board[lastHistoryRecord.newPosition.y][lastHistoryRecord.newPosition.x] = lastHistoryRecord.targetPlayerPiece;
    this._history.pop();
  }

  protected static identifyNonGeneralOriginalPiece(position: Position): Piece {
    const { x, y } = position;

    if (this.originalAdvisorPositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Advisor;
    }

    if (this.originalElephantPositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Elephant;
    }

    if (this.originalHorsePositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Horse;
    }

    if (this.originalChariotPositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Chariot;
    }

    if (this.originalCannonPositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Cannon;
    }

    if (this.originalSoldierPositions.find((original) => original.x == x && original.y == y)) {
      return Piece.Soldier;
    }

    return Piece.None;
  }
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerPieceInterface {
  color: PieceColor;
  piece: Piece;
  unfolded: boolean;
}

export class PlayerPiece implements PlayerPieceInterface {
  private readonly _color: PieceColor; // either RED (0) or BLACK (1)
  private readonly _piece: Piece;
  private _unfolded: boolean; // 2 purposes: (1) identify if a piece has moved or not and (2) decide the rule of its next move will comply with the rule of which Piece

  constructor(playerPiece: MysteryChineseChess.PlayerPieceStruct);
  constructor(color: PieceColor, piece: Piece, unfolded: boolean);

  constructor(arg0: PieceColor | MysteryChineseChess.PlayerPieceStruct, piece?: Piece, unfolded?: boolean) {
    if (Object.keys(arg0).length == 3) {
      const playerPiece = arg0 as MysteryChineseChess.PlayerPieceStruct;

      this._color = PieceColor[PieceColor[Number(playerPiece.color)]];
      this._piece = Piece[Piece[Number(playerPiece.piece)]];
      this._unfolded = playerPiece.unfolded;
    } else if (typeof arg0 == 'number' && arg0 in Object.values(PieceColor)) {
      this._color = arg0 as PieceColor;
      this._piece = piece;
      this._unfolded = unfolded;
    }
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

  unfold(unfolded?: boolean): void {
    this._unfolded = typeof unfolded == 'boolean' ? unfolded : true;
  }

  clone(): PlayerPiece {
    return PlayerPiece.clone(this);
  }

  static clone(playerPiece?: PlayerPiece): NullablePlayerPiece {
    return playerPiece ? new PlayerPiece(playerPiece.color, playerPiece.piece, playerPiece.unfolded) : null;
  }
}

export type NullablePlayerPiece = PlayerPiece | null;

interface HistoryRecord {
  sourcePlayerPiece: PlayerPiece;
  targetPlayerPiece?: PlayerPiece;
  oldPosition: Position;
  newPosition: Position;
}

export enum CompetetionResult {
  None = -1,
  RedWon = PieceColor.RED,
  BlackWon = PieceColor.BLACK,
  Draw = 2,
}
