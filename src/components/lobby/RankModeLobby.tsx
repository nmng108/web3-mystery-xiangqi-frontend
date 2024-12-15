import React, { useCallback, useEffect, useState } from 'react';
import {
  Backdrop,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useAuthContext, useGlobalContext } from '../../hooks';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import { ContractError } from '../../contracts/abi';
import { Column, InLobbyTableData, RankModeTable } from '../gametable';
import { getShortErrorMessage, isPositiveBigNumber } from '../../utilities';

// import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

const columns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 20, align: 'center' },
  { id: 'name', label: 'Name', minWidth: 170, align: 'center' },
  { id: 'filledSlots', label: 'Slots', minWidth: 20, align: 'center' },
  { id: 'spectators', label: 'Spectators', minWidth: 30, align: 'center' },
  {
    id: 'stake',
    label: 'Stake',
    minWidth: 170,
    align: 'center',
    format: (value: number) => value.toFixed(10),
  },
];

type Props = {
  rendersLoadingPage: boolean;
};

/**
 * Should only be rendered if user is currently not in any table.
 * @param rendersLoadingPage
 */
const RankModeLobby: React.FC<Props> = ({ rendersLoadingPage }) => {
  const [gameTableList, setGameTableList] = useState<Array<InLobbyTableData>>([]);
  const [loadingTableList, setLoadingTableList] = useState<boolean>(false);
  const {
    currentTable,
    setCurrentTableByTableStruct,
    setFullscreenToastMessage,
    setWaitsForTransactionalActionMessage,
  } = useGlobalContext();
  const { contract, user, setUserByPlayerStruct } = useAuthContext();

  /**
   * Handle `onClick` event of the "Create table" button.
   */
  const handleCreateTable = useCallback(async () => {
    setWaitsForTransactionalActionMessage('Creating table...');

    try {
      await contract.createTable(5 as never, `${user.playerName}'s table` as never, 50 as never);
      contract.on(contract.filters.NewTableCreated, (newTable) => {
        if (newTable.players[0] != user.playerAddress) {
          return;
        }

        contract.off(contract.filters.NewTableCreated);
        setUserByPlayerStruct({ ...user, tableId: newTable.id });
        setCurrentTableByTableStruct(newTable);
        setFullscreenToastMessage({ message: 'Created table', level: 'success' });
        setWaitsForTransactionalActionMessage(undefined);
      });
    } catch (err) {
      console.log(err);

      if ('info' in err && 'error' in err.info && err.info?.error?.code == 4001) {
        setFullscreenToastMessage({
          message: err.info.error.message,
          level: 'error',
          duration: 3000,
        });
      } else {
        setFullscreenToastMessage({ message: err.message, level: 'error' });
      }

      setWaitsForTransactionalActionMessage(undefined);
    }
  }, [
    setWaitsForTransactionalActionMessage,
    contract,
    setCurrentTableByTableStruct,
    setUserByPlayerStruct,
    user,
    setFullscreenToastMessage,
  ]);

  /**
   * Handle `onClick` event of the "Reload" button.
   */
  const handleReloadList = useCallback(() => {
    if (!loadingTableList) {
      setLoadingTableList(true);
    }
  }, [loadingTableList]);

  /**
   * Handle `onClick` event of the "Enter" button.
   */
  const handleEnterTable = useCallback(
    async (gameTable: InLobbyTableData) => {
      if (gameTable.filledSlots == 2) {
        setFullscreenToastMessage({
          message: 'This table is full. Please choose another one.',
          level: 'info',
        });
        return;
      }

      if (!currentTable) {
        setWaitsForTransactionalActionMessage('Entering table...');
        try {
          await contract.joinTable(gameTable.id as never);
          await contract.on(contract.filters.JoinedTable, (playerAddress, _tableId) => {
            if (playerAddress == user.playerAddress && _tableId == gameTable.id) {
              contract.off(contract.filters.JoinedTable);
              setUserByPlayerStruct({ ...user, tableId: _tableId });
              setWaitsForTransactionalActionMessage(undefined);
              // console.log('Joined table %d', _tableId);
            }
          });
        } catch (err) {
          const message: string = getShortErrorMessage(err);

          setFullscreenToastMessage({ message: message, level: 'error' });
          setWaitsForTransactionalActionMessage(undefined);
        }
      } else {
        setFullscreenToastMessage({
          message: 'You have been joining in another table',
          level: 'error',
        });
      }
    },
    [
      currentTable,
      setFullscreenToastMessage,
      contract,
      user,
      setUserByPlayerStruct,
      setWaitsForTransactionalActionMessage,
    ]
  );

  /**
   * Extracted from `useEffect` below to shorten that code block.
   */
  const loadTableList = useCallback(async (): Promise<void> => {
    const list: InLobbyTableData[] = (
      await contract.getAllTables(5 as never, 1 as never, 20 as never).catch((err) => {
        if (err.revert?.name === ContractError.ResourceNotFound) {
          setFullscreenToastMessage({ message: 'Empty room!', level: 'info' });
        }

        return [] as MysteryChineseChess.TableStructOutput[];
      })
    )
      .filter((t) => Number(t.id) != 0)
      .map((t) => new InLobbyTableData(t));

    setGameTableList(list);
    // console.log('All tables', await contract.rankModeTableIndexes(0));
  }, [contract, setFullscreenToastMessage]);

  /**
   * Load table list as soon as use opens this mode or a new contract is set.
   */
  useEffect(() => {
    if (contract) {
      setLoadingTableList(true);
    }
  }, [contract]);

  /**
   * This `useEffect` code block accomplishes the 2 following tasks:<br/>
   * - Fetch table list at the first time visiting component (triggered by `useEffect` above).<br/>
   * - Reload table list if user clicks "Reload".
   */
  useEffect(() => {
    if (loadingTableList && contract) {
      (async function () {
        await loadTableList();
        setLoadingTableList(false);
      })();
    }
  }, [loadingTableList, contract, loadTableList]);

  if (isPositiveBigNumber(currentTable?.matchId)) {
    return null;
  }

  return (
    <>
      {/* Search */}
      {!currentTable && (
        <div className="flex h-8 xl:h-12 2xl:h-16 justify-center items-center">
          <div className="flex space-x-20">
            <Button variant="contained" color="info" className={`bg-white px-4 py-2 rounded`} disabled>
              Join randomly
            </Button>
            <Button
              variant="contained"
              color="info"
              className="bg-white text-black px-4 py-2 rounded"
              onClick={handleCreateTable}
            >
              Create table
            </Button>
          </div>
        </div>
      )}
      {/* Room Options */}
      {!currentTable && (
        <div className="flex grow w-full md:w-5/6 lg:w-4/5 xl:w-3/4 2xl:w-[50rem] box-border border-4 border-amber-950 rounded-2xl mx-auto flex-col justify-stretch items-stretch space-y-2">
          <div className="flex h-8 justify-between">
            <>
              <Button variant="contained" color="info" className="w-1/3 px-2 py-1" onClick={handleReloadList}>
                Reload
              </Button>
              <div className="flex md:col-start-2 justify-end space-x-2">
                <input
                  type="text"
                  placeholder="Find table..."
                  className="px-2 py-1 rounded bg-gray-200 text-black"
                  disabled
                />
                <Button variant="contained" color="info" className="px-4 py-1" disabled>
                  Enter
                </Button>
              </div>
            </>
          </div>

          {/*{!currentTable && (*/}
          <div
            className={`flex min-h-40 h-4/5 2xl:h-3/4 border-2 border-solid border-black rounded-lg flex-col text-blue-950`}
          >
            <div className="relative w-full h-12 justify-self-start">
              {/*<IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>*/}
              {/*  <ArrowBackRoundedIcon />*/}
              {/*</IconButton>*/}
              <Typography variant="h5" className="my-auto">
                Rank
              </Typography>
            </div>
            <Paper className="w-full overflow-hidden">
              <TableContainer className="h-full">
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column, i) => (
                        <TableCell key={i} align={column.align} style={{ minWidth: column.minWidth }}>
                          {column.id === 'id' ? '' : column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {gameTableList //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((gameTableData, i) => {
                        return (
                          <TableRow
                            hover
                            role="checkbox"
                            tabIndex={-1}
                            key={i}
                            className={`${gameTableData.started ? 'bg-blue-gray-500' : ''}`}
                            onClick={() => handleEnterTable(gameTableData)}
                          >
                            {columns.map((column) => {
                              const value = gameTableData[column.id];

                              return (
                                <TableCell key={column.id} align={column.align}>
                                  {column.format && typeof value === 'number'
                                    ? column.format(value)
                                    : column.id === 'filledSlots'
                                      ? `${value.toString()}/2`
                                      : value.toString()}
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
            <Backdrop
              sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
              open={loadingTableList && rendersLoadingPage}
            >
              <CircularProgress color="inherit" /> Loading table list...
            </Backdrop>
          </div>
          {/*)}*/}

          {
            /*Render table if not entered game yet*/ currentTable && !isPositiveBigNumber(currentTable.matchId) && (
              <RankModeTable />
            )
          }
        </div>
      )}
    </>
  );
};

export default RankModeLobby;
