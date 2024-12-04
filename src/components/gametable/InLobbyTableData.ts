import { MysteryChineseChess } from '../../contracts/typechain-types';
import {type BigNumberish} from 'ethers';
import { type TableCellProps } from '@mui/material';
import { isNonZeroAddress } from '../../utilities';

export interface Column extends TableCellProps {
  id: keyof InLobbyTableData;
  label: string;
  minWidth?: number;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  format?: (value: number) => string;
}

class InLobbyTableData {
  private readonly _id: BigNumberish;
  private _name: string;
  private _filledSlots: number;
  private _stake: BigNumberish;
  private _spectators: number;
  private _started: boolean;

  public constructor(tableStruct: MysteryChineseChess.TableStructOutput) {
    this._id = tableStruct.id;
    this._name = tableStruct.name;
    this._filledSlots = tableStruct.players.reduce<number>((prev, current, idx) => prev + (isNonZeroAddress(tableStruct.players[idx]) ? 1 : 0), 0);
    this._stake = tableStruct.stake;
    this._spectators = 0;
    this._started = tableStruct.matchId.toString() != '0';
  }

  get id(): BigNumberish {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get filledSlots(): number {
    return this._filledSlots;
  }

  get stake(): BigNumberish {
    return this._stake;
  }

  get spectators(): number {
    return this._spectators;
  }

  get started(): boolean {
    return this._started;
  }
}

export default InLobbyTableData;