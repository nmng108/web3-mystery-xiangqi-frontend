/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from '../common';

export declare namespace MysteryChineseChess {
  export type MatchResultStruct = {
    winnerIndex: BigNumberish;
    resultType: BigNumberish;
    increasingElo: BigNumberish;
    decreasingElo: BigNumberish;
  };

  export type MatchResultStructOutput = [
    winnerIndex: bigint,
    resultType: bigint,
    increasingElo: bigint,
    decreasingElo: bigint,
  ] & {
    winnerIndex: bigint;
    resultType: bigint;
    increasingElo: bigint;
    decreasingElo: bigint;
  };

  export type PlayerStruct = {
    playerAddress: AddressLike;
    playerName: string;
    elo: BigNumberish;
    tableId: BigNumberish;
  };

  export type PlayerStructOutput = [
    playerAddress: string,
    playerName: string,
    elo: bigint,
    tableId: bigint,
  ] & {
    playerAddress: string;
    playerName: string;
    elo: bigint;
    tableId: bigint;
  };

  export type TableStruct = {
    id: BigNumberish;
    gameMode: BigNumberish;
    name: string;
    players: [AddressLike, AddressLike];
    hostIndex: BigNumberish;
    stake: BigNumberish;
    timeControl: BigNumberish;
    matchId: BigNumberish;
  };

  export type TableStructOutput = [
    id: bigint,
    gameMode: bigint,
    name: string,
    players: [string, string],
    hostIndex: bigint,
    stake: bigint,
    timeControl: bigint,
    matchId: bigint,
  ] & {
    id: bigint;
    gameMode: bigint;
    name: string;
    players: [string, string];
    hostIndex: bigint;
    stake: bigint;
    timeControl: bigint;
    matchId: bigint;
  };

  export type PlayerPieceStruct = {
    color: BigNumberish;
    piece: BigNumberish;
    unfolded: boolean;
  };

  export type PlayerPieceStructOutput = [color: bigint, piece: bigint, unfolded: boolean] & {
    color: bigint;
    piece: bigint;
    unfolded: boolean;
  };

  export type PositionStruct = { row: BigNumberish; column: BigNumberish };

  export type PositionStructOutput = [row: bigint, column: bigint] & {
    row: bigint;
    column: bigint;
  };

  export type MatchStruct = {
    id: BigNumberish;
    gameMode: BigNumberish;
    players: [AddressLike, AddressLike];
    stake: BigNumberish;
    timeControl: BigNumberish;
    startTimestamp: BigNumberish;
    endTimestamp: BigNumberish;
    gameStatus: BigNumberish;
    matchResult: MysteryChineseChess.MatchResultStruct;
    board: MysteryChineseChess.PlayerPieceStruct[][];
    steps: [MysteryChineseChess.PositionStruct, MysteryChineseChess.PositionStruct][];
  };

  export type MatchStructOutput = [
    id: bigint,
    gameMode: bigint,
    players: [string, string],
    stake: bigint,
    timeControl: bigint,
    startTimestamp: bigint,
    endTimestamp: bigint,
    gameStatus: bigint,
    matchResult: MysteryChineseChess.MatchResultStructOutput,
    board: MysteryChineseChess.PlayerPieceStructOutput[][],
    steps: [MysteryChineseChess.PositionStructOutput, MysteryChineseChess.PositionStructOutput][],
  ] & {
    id: bigint;
    gameMode: bigint;
    players: [string, string];
    stake: bigint;
    timeControl: bigint;
    startTimestamp: bigint;
    endTimestamp: bigint;
    gameStatus: bigint;
    matchResult: MysteryChineseChess.MatchResultStructOutput;
    board: MysteryChineseChess.PlayerPieceStructOutput[][];
    steps: [MysteryChineseChess.PositionStructOutput, MysteryChineseChess.PositionStructOutput][];
  };
}

export interface MysteryChineseChessInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'BLACK'
      | 'MAX_TIME_CONTROL'
      | 'RED'
      | 'createTable'
      | 'exitTable'
      | 'getAllMatches'
      | 'getAllPlayers'
      | 'getAllTables'
      | 'getMatch'
      | 'getPlayer'
      | 'getTable'
      | 'initializeTables'
      | 'isPlayer'
      | 'joinTable'
      | 'matchIndexes'
      | 'matches'
      | 'move'
      | 'normalModeAdvancedTableIndexes'
      | 'normalModeBeginnerTableIndexes'
      | 'normalModeIntermediateTableIndexes'
      | 'offerDraw'
      | 'originalPieces'
      | 'owner'
      | 'playerIndexes'
      | 'players'
      | 'rankModeTableIndexes'
      | 'registerPlayer'
      | 'renounceOwnership'
      | 'resign'
      | 'startNewMatch'
      | 'tables'
      | 'transferOwnership'
      | 'updatePlayer'
      | 'updateTable'
      | 'verifyCheckmate'
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'ExitedTable'
      | 'JoinedTable'
      | 'MatchEnded'
      | 'NewMatchStarted'
      | 'NewPlayer'
      | 'NewTableCreated'
      | 'OwnershipTransferred'
      | 'UpdatedPlayerInfo'
      | 'UpdatedTable'
      | 'UpdatedTableId'
  ): EventFragment;

  encodeFunctionData(functionFragment: 'BLACK', values?: undefined): string;
  encodeFunctionData(functionFragment: 'MAX_TIME_CONTROL', values?: undefined): string;
  encodeFunctionData(functionFragment: 'RED', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'createTable',
    values: [BigNumberish, string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'exitTable', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getAllMatches', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getAllPlayers', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'getAllTables',
    values: [BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'getMatch', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getPlayer', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'getTable', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'initializeTables', values?: undefined): string;
  encodeFunctionData(functionFragment: 'isPlayer', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'joinTable', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'matchIndexes', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'matches', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'move',
    values: [BigNumberish, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'normalModeAdvancedTableIndexes',
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'normalModeBeginnerTableIndexes',
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: 'normalModeIntermediateTableIndexes',
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'offerDraw', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'originalPieces',
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'playerIndexes', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'players', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'rankModeTableIndexes', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'registerPlayer', values: [string]): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'resign', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'startNewMatch', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'tables', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'updatePlayer',
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: 'updateTable',
    values: [MysteryChineseChess.TableStruct]
  ): string;
  encodeFunctionData(functionFragment: 'verifyCheckmate', values: [BigNumberish]): string;

  decodeFunctionResult(functionFragment: 'BLACK', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'MAX_TIME_CONTROL', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'RED', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'createTable', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'exitTable', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllMatches', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllPlayers', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getAllTables', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getMatch', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getPlayer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getTable', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initializeTables', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'isPlayer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'joinTable', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'matchIndexes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'matches', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'move', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'normalModeAdvancedTableIndexes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'normalModeBeginnerTableIndexes', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'normalModeIntermediateTableIndexes',
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: 'offerDraw', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'originalPieces', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'playerIndexes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'players', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'rankModeTableIndexes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'registerPlayer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'resign', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'startNewMatch', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'tables', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'updatePlayer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'updateTable', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'verifyCheckmate', data: BytesLike): Result;
}

export namespace ExitedTableEvent {
  export type InputTuple = [playerAddress: AddressLike, tableId: BigNumberish];
  export type OutputTuple = [playerAddress: string, tableId: bigint];
  export interface OutputObject {
    playerAddress: string;
    tableId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace JoinedTableEvent {
  export type InputTuple = [playerAddress: AddressLike, tableId: BigNumberish];
  export type OutputTuple = [playerAddress: string, tableId: bigint];
  export interface OutputObject {
    playerAddress: string;
    tableId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MatchEndedEvent {
  export type InputTuple = [
    matchId: BigNumberish,
    matchResult: MysteryChineseChess.MatchResultStruct,
    winner: AddressLike,
    loser: AddressLike,
  ];
  export type OutputTuple = [
    matchId: bigint,
    matchResult: MysteryChineseChess.MatchResultStructOutput,
    winner: string,
    loser: string,
  ];
  export interface OutputObject {
    matchId: bigint;
    matchResult: MysteryChineseChess.MatchResultStructOutput;
    winner: string;
    loser: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewMatchStartedEvent {
  export type InputTuple = [matchId: BigNumberish, players: [AddressLike, AddressLike]];
  export type OutputTuple = [matchId: bigint, players: [string, string]];
  export interface OutputObject {
    matchId: bigint;
    players: [string, string];
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewPlayerEvent {
  export type InputTuple = [player: MysteryChineseChess.PlayerStruct];
  export type OutputTuple = [player: MysteryChineseChess.PlayerStructOutput];
  export interface OutputObject {
    player: MysteryChineseChess.PlayerStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NewTableCreatedEvent {
  export type InputTuple = [table: MysteryChineseChess.TableStruct];
  export type OutputTuple = [table: MysteryChineseChess.TableStructOutput];
  export interface OutputObject {
    table: MysteryChineseChess.TableStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpdatedPlayerInfoEvent {
  export type InputTuple = [playerAddress: AddressLike];
  export type OutputTuple = [playerAddress: string];
  export interface OutputObject {
    playerAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpdatedTableEvent {
  export type InputTuple = [table: MysteryChineseChess.TableStruct];
  export type OutputTuple = [table: MysteryChineseChess.TableStructOutput];
  export interface OutputObject {
    table: MysteryChineseChess.TableStructOutput;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UpdatedTableIdEvent {
  export type InputTuple = [oldTableId: BigNumberish, newTableId: BigNumberish];
  export type OutputTuple = [oldTableId: bigint, newTableId: bigint];
  export interface OutputObject {
    oldTableId: bigint;
    newTableId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface MysteryChineseChess extends BaseContract {
  connect(runner?: ContractRunner | null): MysteryChineseChess;
  waitForDeployment(): Promise<this>;

  interface: MysteryChineseChessInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  BLACK: TypedContractMethod<[], [bigint], 'view'>;

  MAX_TIME_CONTROL: TypedContractMethod<[], [bigint], 'view'>;

  RED: TypedContractMethod<[], [bigint], 'view'>;

  createTable: TypedContractMethod<
    [gameMode: BigNumberish, name: string, stake: BigNumberish],
    [void],
    'nonpayable'
  >;

  exitTable: TypedContractMethod<[tableId: BigNumberish], [void], 'nonpayable'>;

  getAllMatches: TypedContractMethod<[], [MysteryChineseChess.MatchStructOutput[]], 'view'>;

  getAllPlayers: TypedContractMethod<[], [MysteryChineseChess.PlayerStructOutput[]], 'view'>;

  getAllTables: TypedContractMethod<
    [gameMode: BigNumberish, page: BigNumberish, size: BigNumberish],
    [MysteryChineseChess.TableStructOutput[]],
    'view'
  >;

  getMatch: TypedContractMethod<
    [id: BigNumberish],
    [MysteryChineseChess.MatchStructOutput],
    'view'
  >;

  getPlayer: TypedContractMethod<
    [_addr: AddressLike],
    [MysteryChineseChess.PlayerStructOutput],
    'view'
  >;

  getTable: TypedContractMethod<
    [id: BigNumberish],
    [MysteryChineseChess.TableStructOutput],
    'view'
  >;

  initializeTables: TypedContractMethod<[], [void], 'payable'>;

  isPlayer: TypedContractMethod<[_addr: AddressLike], [boolean], 'view'>;

  joinTable: TypedContractMethod<[tableId: BigNumberish], [void], 'nonpayable'>;

  matchIndexes: TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;

  matches: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        MysteryChineseChess.MatchResultStructOutput,
      ] & {
        id: bigint;
        gameMode: bigint;
        stake: bigint;
        timeControl: bigint;
        startTimestamp: bigint;
        endTimestamp: bigint;
        gameStatus: bigint;
        matchResult: MysteryChineseChess.MatchResultStructOutput;
      },
    ],
    'view'
  >;

  move: TypedContractMethod<
    [
      sourceRow: BigNumberish,
      sourceCol: BigNumberish,
      destRow: BigNumberish,
      destCol: BigNumberish,
    ],
    [boolean],
    'payable'
  >;

  normalModeAdvancedTableIndexes: TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;

  normalModeBeginnerTableIndexes: TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;

  normalModeIntermediateTableIndexes: TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;

  offerDraw: TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;

  originalPieces: TypedContractMethod<[arg0: BigNumberish, arg1: BigNumberish], [bigint], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  playerIndexes: TypedContractMethod<[arg0: AddressLike], [bigint], 'view'>;

  players: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, string, bigint, bigint] & {
        playerAddress: string;
        playerName: string;
        elo: bigint;
        tableId: bigint;
      },
    ],
    'view'
  >;

  rankModeTableIndexes: TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;

  registerPlayer: TypedContractMethod<[_name: string], [void], 'payable'>;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  resign: TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;

  startNewMatch: TypedContractMethod<[tableId: BigNumberish], [void], 'payable'>;

  tables: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, bigint, string, bigint, bigint, bigint, bigint] & {
        id: bigint;
        gameMode: bigint;
        name: string;
        hostIndex: bigint;
        stake: bigint;
        timeControl: bigint;
        matchId: bigint;
      },
    ],
    'view'
  >;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  updatePlayer: TypedContractMethod<
    [playerName: string, tableId: BigNumberish, setsTableId: boolean],
    [void],
    'nonpayable'
  >;

  updateTable: TypedContractMethod<
    [c_table: MysteryChineseChess.TableStruct],
    [void],
    'nonpayable'
  >;

  verifyCheckmate: TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'BLACK'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'MAX_TIME_CONTROL'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'RED'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'createTable'
  ): TypedContractMethod<
    [gameMode: BigNumberish, name: string, stake: BigNumberish],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'exitTable'
  ): TypedContractMethod<[tableId: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'getAllMatches'
  ): TypedContractMethod<[], [MysteryChineseChess.MatchStructOutput[]], 'view'>;
  getFunction(
    nameOrSignature: 'getAllPlayers'
  ): TypedContractMethod<[], [MysteryChineseChess.PlayerStructOutput[]], 'view'>;
  getFunction(
    nameOrSignature: 'getAllTables'
  ): TypedContractMethod<
    [gameMode: BigNumberish, page: BigNumberish, size: BigNumberish],
    [MysteryChineseChess.TableStructOutput[]],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getMatch'
  ): TypedContractMethod<[id: BigNumberish], [MysteryChineseChess.MatchStructOutput], 'view'>;
  getFunction(
    nameOrSignature: 'getPlayer'
  ): TypedContractMethod<[_addr: AddressLike], [MysteryChineseChess.PlayerStructOutput], 'view'>;
  getFunction(
    nameOrSignature: 'getTable'
  ): TypedContractMethod<[id: BigNumberish], [MysteryChineseChess.TableStructOutput], 'view'>;
  getFunction(nameOrSignature: 'initializeTables'): TypedContractMethod<[], [void], 'payable'>;
  getFunction(
    nameOrSignature: 'isPlayer'
  ): TypedContractMethod<[_addr: AddressLike], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'joinTable'
  ): TypedContractMethod<[tableId: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'matchIndexes'
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;
  getFunction(nameOrSignature: 'matches'): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        MysteryChineseChess.MatchResultStructOutput,
      ] & {
        id: bigint;
        gameMode: bigint;
        stake: bigint;
        timeControl: bigint;
        startTimestamp: bigint;
        endTimestamp: bigint;
        gameStatus: bigint;
        matchResult: MysteryChineseChess.MatchResultStructOutput;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'move'
  ): TypedContractMethod<
    [
      sourceRow: BigNumberish,
      sourceCol: BigNumberish,
      destRow: BigNumberish,
      destCol: BigNumberish,
    ],
    [boolean],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'normalModeAdvancedTableIndexes'
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'normalModeBeginnerTableIndexes'
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'normalModeIntermediateTableIndexes'
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'offerDraw'
  ): TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;
  getFunction(
    nameOrSignature: 'originalPieces'
  ): TypedContractMethod<[arg0: BigNumberish, arg1: BigNumberish], [bigint], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'playerIndexes'
  ): TypedContractMethod<[arg0: AddressLike], [bigint], 'view'>;
  getFunction(nameOrSignature: 'players'): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, string, bigint, bigint] & {
        playerAddress: string;
        playerName: string;
        elo: bigint;
        tableId: bigint;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'rankModeTableIndexes'
  ): TypedContractMethod<[arg0: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'registerPlayer'
  ): TypedContractMethod<[_name: string], [void], 'payable'>;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'resign'
  ): TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;
  getFunction(
    nameOrSignature: 'startNewMatch'
  ): TypedContractMethod<[tableId: BigNumberish], [void], 'payable'>;
  getFunction(nameOrSignature: 'tables'): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, bigint, string, bigint, bigint, bigint, bigint] & {
        id: bigint;
        gameMode: bigint;
        name: string;
        hostIndex: bigint;
        stake: bigint;
        timeControl: bigint;
        matchId: bigint;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'transferOwnership'
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'updatePlayer'
  ): TypedContractMethod<
    [playerName: string, tableId: BigNumberish, setsTableId: boolean],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'updateTable'
  ): TypedContractMethod<[c_table: MysteryChineseChess.TableStruct], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'verifyCheckmate'
  ): TypedContractMethod<[matchId: BigNumberish], [void], 'payable'>;

  getEvent(
    key: 'ExitedTable'
  ): TypedContractEvent<
    ExitedTableEvent.InputTuple,
    ExitedTableEvent.OutputTuple,
    ExitedTableEvent.OutputObject
  >;
  getEvent(
    key: 'JoinedTable'
  ): TypedContractEvent<
    JoinedTableEvent.InputTuple,
    JoinedTableEvent.OutputTuple,
    JoinedTableEvent.OutputObject
  >;
  getEvent(
    key: 'MatchEnded'
  ): TypedContractEvent<
    MatchEndedEvent.InputTuple,
    MatchEndedEvent.OutputTuple,
    MatchEndedEvent.OutputObject
  >;
  getEvent(
    key: 'NewMatchStarted'
  ): TypedContractEvent<
    NewMatchStartedEvent.InputTuple,
    NewMatchStartedEvent.OutputTuple,
    NewMatchStartedEvent.OutputObject
  >;
  getEvent(
    key: 'NewPlayer'
  ): TypedContractEvent<
    NewPlayerEvent.InputTuple,
    NewPlayerEvent.OutputTuple,
    NewPlayerEvent.OutputObject
  >;
  getEvent(
    key: 'NewTableCreated'
  ): TypedContractEvent<
    NewTableCreatedEvent.InputTuple,
    NewTableCreatedEvent.OutputTuple,
    NewTableCreatedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferred'
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'UpdatedPlayerInfo'
  ): TypedContractEvent<
    UpdatedPlayerInfoEvent.InputTuple,
    UpdatedPlayerInfoEvent.OutputTuple,
    UpdatedPlayerInfoEvent.OutputObject
  >;
  getEvent(
    key: 'UpdatedTable'
  ): TypedContractEvent<
    UpdatedTableEvent.InputTuple,
    UpdatedTableEvent.OutputTuple,
    UpdatedTableEvent.OutputObject
  >;
  getEvent(
    key: 'UpdatedTableId'
  ): TypedContractEvent<
    UpdatedTableIdEvent.InputTuple,
    UpdatedTableIdEvent.OutputTuple,
    UpdatedTableIdEvent.OutputObject
  >;

  filters: {
    'ExitedTable(address,uint256)': TypedContractEvent<
      ExitedTableEvent.InputTuple,
      ExitedTableEvent.OutputTuple,
      ExitedTableEvent.OutputObject
    >;
    ExitedTable: TypedContractEvent<
      ExitedTableEvent.InputTuple,
      ExitedTableEvent.OutputTuple,
      ExitedTableEvent.OutputObject
    >;

    'JoinedTable(address,uint256)': TypedContractEvent<
      JoinedTableEvent.InputTuple,
      JoinedTableEvent.OutputTuple,
      JoinedTableEvent.OutputObject
    >;
    JoinedTable: TypedContractEvent<
      JoinedTableEvent.InputTuple,
      JoinedTableEvent.OutputTuple,
      JoinedTableEvent.OutputObject
    >;

    'MatchEnded(uint256,tuple,address,address)': TypedContractEvent<
      MatchEndedEvent.InputTuple,
      MatchEndedEvent.OutputTuple,
      MatchEndedEvent.OutputObject
    >;
    MatchEnded: TypedContractEvent<
      MatchEndedEvent.InputTuple,
      MatchEndedEvent.OutputTuple,
      MatchEndedEvent.OutputObject
    >;

    'NewMatchStarted(uint256,address[2])': TypedContractEvent<
      NewMatchStartedEvent.InputTuple,
      NewMatchStartedEvent.OutputTuple,
      NewMatchStartedEvent.OutputObject
    >;
    NewMatchStarted: TypedContractEvent<
      NewMatchStartedEvent.InputTuple,
      NewMatchStartedEvent.OutputTuple,
      NewMatchStartedEvent.OutputObject
    >;

    'NewPlayer(tuple)': TypedContractEvent<
      NewPlayerEvent.InputTuple,
      NewPlayerEvent.OutputTuple,
      NewPlayerEvent.OutputObject
    >;
    NewPlayer: TypedContractEvent<
      NewPlayerEvent.InputTuple,
      NewPlayerEvent.OutputTuple,
      NewPlayerEvent.OutputObject
    >;

    'NewTableCreated(tuple)': TypedContractEvent<
      NewTableCreatedEvent.InputTuple,
      NewTableCreatedEvent.OutputTuple,
      NewTableCreatedEvent.OutputObject
    >;
    NewTableCreated: TypedContractEvent<
      NewTableCreatedEvent.InputTuple,
      NewTableCreatedEvent.OutputTuple,
      NewTableCreatedEvent.OutputObject
    >;

    'OwnershipTransferred(address,address)': TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    'UpdatedPlayerInfo(address)': TypedContractEvent<
      UpdatedPlayerInfoEvent.InputTuple,
      UpdatedPlayerInfoEvent.OutputTuple,
      UpdatedPlayerInfoEvent.OutputObject
    >;
    UpdatedPlayerInfo: TypedContractEvent<
      UpdatedPlayerInfoEvent.InputTuple,
      UpdatedPlayerInfoEvent.OutputTuple,
      UpdatedPlayerInfoEvent.OutputObject
    >;

    'UpdatedTable(tuple)': TypedContractEvent<
      UpdatedTableEvent.InputTuple,
      UpdatedTableEvent.OutputTuple,
      UpdatedTableEvent.OutputObject
    >;
    UpdatedTable: TypedContractEvent<
      UpdatedTableEvent.InputTuple,
      UpdatedTableEvent.OutputTuple,
      UpdatedTableEvent.OutputObject
    >;

    'UpdatedTableId(uint256,uint256)': TypedContractEvent<
      UpdatedTableIdEvent.InputTuple,
      UpdatedTableIdEvent.OutputTuple,
      UpdatedTableIdEvent.OutputObject
    >;
    UpdatedTableId: TypedContractEvent<
      UpdatedTableIdEvent.InputTuple,
      UpdatedTableIdEvent.OutputTuple,
      UpdatedTableIdEvent.OutputObject
    >;
  };
}
