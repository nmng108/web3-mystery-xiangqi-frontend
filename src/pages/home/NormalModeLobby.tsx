import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
// import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

interface Column {
  id: keyof GameTable;
  label: string;
  minWidth?: number;
  align?: string;
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 20, align: 'center' },
  { id: 'name', label: 'Name', minWidth: 170, align: 'center' },
  { id: 'filledSlots', label: 'Slots', minWidth: 20, align: 'center' },
  { id: 'spectators', label: 'Spectators', minWidth: 30, align: 'center' },
  { id: 'stake', label: 'Stake', minWidth: 170, align: 'center', format: (value: number) => value.toFixed(10) },
];

class RoomLevel {
  private readonly _number: number;
  private readonly _code: string;
  private readonly _title: string;

  public readonly static BEGINNER = new RoomLevel(0, 'BEGINNER', 'Beginner room');
  public readonly static INTERMEDIATE = new RoomLevel(1, 'INTERMEDIATE', 'Intermediate room');
  public readonly static ADVANCED = new RoomLevel(2, 'ADVANCED', 'Advanced room');

  private constructor(number: number, code: string, title: string) {
    this._number = number;
    this._code = code;
    this._title = title;
  }

  get number(): number {
    return this._number;
  }

  get code(): string {
    return this._code;
  }

  get title(): string {
    return this._title;
  }
}

class GameTable {
  private readonly _id: number;
  private _name: string;
  private _filledSlots: number;
  private _stake: number;
  private _spectators: number;
  private _started: boolean;

  public constructor(id: number, name: string, filledSlots: number, stake: number, spectators: number, started: boolean) {
    this._id = id;
    this._name = name;
    this._filledSlots = filledSlots;
    this._stake = stake;
    this._spectators = spectators;
    this._started = started;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get filledSlots(): number {
    return this._filledSlots;
  }

  get stake(): number {
    return this._stake;
  }

  get spectators(): number {
    return this._spectators;
  }

  get started(): boolean {
    return this._started;
  }
}

type Props = object;

const NormalModeLobby: React.FC<Props> = () => {
  const [level, setLevel] = useState<RoomLevel>();
  const [gameTableList, setGameTableList] = useState<Array<GameTable>>([]);
  const [inTable, setInTable] = useState<boolean>(false);
  const [tableName, setTableName] = useState();

  const handleBackButton = () => {
    if (level) {
      if (inTable) {
        setInTable(!inTable);
      } else {
        setLevel(null);
      }
    }
  };

  const handleSelectRoomLevel = useCallback((roomLevel: RoomLevel) => {
    setLevel(roomLevel);

  }, []);

  const handleEnterRoom = useCallback((gameTable: GameTable) => {
    // Send API to request to enter the selected table
    // Update DOM
    setInTable(true);
    let tableName =
    setTableName()
  }, [level, setInTable]);

  useEffect(() => {
    // Call API to fetch table list
    if (typeof level !== 'undefined' && level !== null) {
      setGameTableList([
        new GameTable(1, 'n0', 0, 0, 0, false),
        new GameTable(2, 'n098', 1, 0.2241, 1, false),
        new GameTable(3, 'n234', 2, 1.4513, 19, true),
        new GameTable(4, 'n565', 1, 0.09419, 3, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
        new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
      ]);
    }

    return () => {
      setGameTableList([]);
    };
  }, [level, setGameTableList]);
  return (
    <div className="flex border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
      {level ? (
        <>
          <div className="relative w-full h-12 justify-self-start">
            <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>
              <ArrowBackRoundedIcon />
            </IconButton>
            <Typography variant="h5" className="my-auto">{level.title}</Typography>
          </div>
          <Paper className="w-full overflow-hidden">
            <TableContainer className="h-full">
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.id === 'id' ? '' : column.label}wfwekjgnekjgnewgfnewjkfnewdjdjdjdkdkverfherrereetherdsalslsdlsolswew
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gameTableList //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((gameTableData, i) => {
                      return (
                        <TableRow hover role="checkbox" tabIndex={-1} key={i}
                                  className={`${gameTableData.started ? 'bg-blue-gray-500' : ''}`}
                                  onClick={() => handleEnterRoom(gameTableData)}
                        >
                          {columns.map((column) => {
                            const value = gameTableData[column.id];

                            return (
                              <TableCell key={column.id} align={column.align}>
                                {column.format && typeof value === 'number' ?
                                  column.format(value)
                                  :
                                  (column.id === 'filledSlots') ?
                                    `${value}/2`
                                    :
                                    value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            {/*<TablePagination*/}
            {/*  rowsPerPageOptions={[10, 25, 100]}*/}
            {/*  component="div"*/}
            {/*  count={tables.length}*/}
            {/*  rowsPerPage={rowsPerPage}*/}
            {/*  page={page}*/}
            {/*  onPageChange={handleChangePage}*/}
            {/*  onRowsPerPageChange={handleChangeRowsPerPage}*/}
            {/*/>*/}
          </Paper>
        </>
      ) : (
        <div className="flex grow row-start-2 flex-col justify-center space-y-4">
          <Button
            variant="outlined"
            color="info"
            className="p-4 rounded-lg shadow-md text-center bg-neutral-800"
            onClick={() => handleSelectRoomLevel(RoomLevel.BEGINNER)}>
            <p className="font-semibold text-lg">Beginner room</p>
          </Button>
          <Button
            variant="outlined"
            color="info"
            className="p-4 rounded-lg shadow-md text-center bg-neutral-800"
            onClick={() => handleSelectRoomLevel(RoomLevel.INTERMEDIATE)}>
            <p className="font-semibold text-lg">Intermediate room</p>
          </Button>
          <Button
            variant="outlined"
            color="info"
            className="p-4 rounded-lg shadow-md text-center bg-neutral-800"
            onClick={() => handleSelectRoomLevel(RoomLevel.ADVANCED)}>
            <p className="font-semibold text-lg">Advanced room</p>
          </Button>
        </div>
      )}
    </div>
  );
};

export default NormalModeLobby;