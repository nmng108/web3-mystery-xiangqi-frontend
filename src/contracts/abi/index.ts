export enum ContractError {
  Unauthorized = 'Unauthorized',
  ResourceNotFound = 'ResourceNotFound',
  InvalidAction = 'InvalidAction',
}

export enum PieceColor {
  RED,
  BLACK,
  NONE,
}

export enum Piece {
  None,
  General, // king
  Advisor, // guard, assistant
  Elephant, // bishop
  Horse, // knight
  Chariot, // rook, car
  Cannon,
  Soldier, // pawn
}

export enum MatchStatus {
  Started,
  Paused,
  Ended,
}

export enum MatchResultType {
  None,
  // Win reasons //
  Checkmate,
  Timeout,
  OutOfTurns,
  FiveFold,
  Resign,
  LeaveMatch,
  ////
  // Draw reasons //
  Stalemate,
  Draw,
  /* Require index of the player had offered */
  OfferToDraw,
  ////
}

export enum Vote {
  None,
  Approve,
  Decline,
}
