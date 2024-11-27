export class NormalRoomLevel {
  private readonly _number: number;
  private readonly _code: string;
  private readonly _name: string;

  public static readonly BEGINNER = new NormalRoomLevel(0, 'BEGINNER', 'Beginner room');
  public static readonly INTERMEDIATE = new NormalRoomLevel(1, 'INTERMEDIATE', 'Intermediate room');
  public static readonly ADVANCED = new NormalRoomLevel(2, 'ADVANCED', 'Advanced room');

  private constructor(number: number, code: string, title: string) {
    this._number = number;
    this._code = code;
    this._name = title;
  }

  get number(): number {
    return this._number;
  }

  get code(): string {
    return this._code;
  }

  get name(): string {
    return this._name;
  }
}

export enum PieceColor {
  RED,
  BLACK
}

export enum Piece {
  None,
  General, // king
  Advisor, // guard, assistant
  Elephant, // bishop
  Horse, // knight
  Chariot, // rook, car
  Cannon,
  Soldier // pawn
}

export enum MatchStatus {
  Started,
  Paused,
  Ended
}
