import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  type PaperProps,
  TextField,
  Typography,
} from '@mui/material';
import { type AddressLike, type BigNumberish } from 'ethers';
import {
  useAuthContext,
  useGlobalContext,
  useInTableContext,
  usePeerContext,
  useWalletProviderContext,
} from '../../hooks';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import { getShortErrorMessage, isEqual, isNonZeroAddress, isPositiveBigNumber, isSameAddress } from '../../utilities';
import { ContractError } from '../../contracts/abi';
import PlayerTag from './PlayerTag';
import { P2PExchangeMessageInterface, P2PMessageType } from '../../p2pExchangeMessage.ts';

const RankModeTable: React.FC = () => {
  const [opensTableSettings, setOpensTableSettings] = useState<boolean>(false);
  const [waitsForCreatingNewMatch, setWaitsForCreatingNewMatch] = useState<boolean>(false);
  const { disconnectWallet } = useWalletProviderContext();
  const {
    currentTable,
    setCurrentTableByTableStruct,
    setFullscreenToastMessage,
    setWaitsForTransactionalActionMessage,
  } = useGlobalContext();
  const { contract, user, setUserByPlayerStruct } = useAuthContext();
  const { peer, opponentConnection, connectOpponentPeerAddress } = usePeerContext();
  const { players, isHost, setIsConnectingToPeer, peerConnectionTimedOut, setKeepsConnectionFromStart } =
    useInTableContext();

  const handleExitTable = useCallback(async () => {
    if (currentTable && user) {
      try {
        setWaitsForTransactionalActionMessage('Exiting...');
        await contract.exitTable(currentTable.id as never);
      } catch (err) {
        // let message: string = err.toString();
        // message = getShortErrorMessage(err);
        // if ('code' in err && 'info' in err && 'error' in err.info && 'message' in err.info.error) {
        //   message = err.info.error.message;
        // } else if ('code' in err && 'error' in err && 'message' in err.error) {
        //   message = err.error.message;
        //   // console.log('keys: ', Object.keys(err).forEach(k => console.log(k, ' - ', err[k])));
        // }

        setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
        setWaitsForTransactionalActionMessage(undefined);
      }
    }
  }, [currentTable, user, setWaitsForTransactionalActionMessage, contract, setFullscreenToastMessage]);

  const handleOpenCloseTableSettings = useCallback(() => {
    setOpensTableSettings(!opensTableSettings);
  }, [opensTableSettings]);

  const onSaveTableSettings = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      type FormJson = { name: string; timeControl: number; stake: number };
      const formJson: FormJson = Object.fromEntries(new FormData(event.currentTarget).entries()) as unknown as FormJson;
      const name: string = formJson.name;
      const timeControl: number = formJson.timeControl;
      const stake: number = formJson.stake || Number(currentTable.stake);
      const newTableSettings: MysteryChineseChess.TableStruct = {
        ...currentTable,
        name: name,
        timeControl: timeControl * 60 * 1000,
        stake: stake || currentTable.stake,
      };

      console.log(newTableSettings);
      await contract
        .updateTable(currentTable.id as never, name as never, (timeControl * 60 * 1000) as never, stake as never)
        .catch((err) => {
          setFullscreenToastMessage({ message: getShortErrorMessage(err), level: 'error' });
          throw err;
        });

      setWaitsForTransactionalActionMessage('Updating table...');
      handleOpenCloseTableSettings();
    },
    [
      contract,
      currentTable,
      handleOpenCloseTableSettings,
      setFullscreenToastMessage,
      setWaitsForTransactionalActionMessage,
    ]
  );

  const handleStartNewMatch = useCallback(async () => {
    if (!currentTable) {
      return;
    }

    if (currentTable.players.filter(isNonZeroAddress).length < 2) {
      setFullscreenToastMessage({ message: 'Opponent is not found. Cannot start!', level: 'error' });
      return;
    }

    if (!opponentConnection || !opponentConnection.open) {
      setFullscreenToastMessage({ message: 'You are disconnecting to opponent. Cannot start!', level: 'error' });
      return;
    }

    try {
      // Update states of players, create new match, update state of table
      setWaitsForTransactionalActionMessage('Confirming... (you may get a small fee to verify this transaction)');
      await contract.startNewMatch(currentTable.id as never);
      setWaitsForTransactionalActionMessage(null);
      setWaitsForCreatingNewMatch(true);
      opponentConnection.send({ type: P2PMessageType.START_GAME } as P2PExchangeMessageInterface);
    } catch (err) {
      const message = err.revert?.name == ContractError.InvalidAction ? err.revert.message : getShortErrorMessage(err);

      setWaitsForTransactionalActionMessage(null);
      setWaitsForCreatingNewMatch(false);
      setFullscreenToastMessage({ message: message, level: 'error', duration: 3000 });
    }
  }, [currentTable, opponentConnection, setFullscreenToastMessage, contract, setWaitsForTransactionalActionMessage]);

  // Set contract's event listeners relating to table
  useEffect(() => {
    let handleNewMatchStartedEvent: (matchId: BigNumberish, _playerAddresses: [AddressLike, AddressLike]) => void;
    let handleJoinedTable: (playerAddress: AddressLike, tableId: BigNumberish) => void;
    let handleUpdatedTable: (table: MysteryChineseChess.TableStructOutput) => void;
    let handleUpdatedTableId: (oldTableId: BigNumberish, newTableId: BigNumberish) => void;
    let handleExitedTable: (playerAddress: AddressLike, tableId: BigNumberish) => void;

    if (contract && currentTable) {
      console.log('create table-related listeners');
      handleNewMatchStartedEvent = (matchId, _playerAddresses) => {
        if (_playerAddresses.find((addr) => isSameAddress(addr, user.playerAddress))) {
          contract.off(contract.filters.NewMatchStarted, handleNewMatchStartedEvent);
          setCurrentTableByTableStruct({ ...currentTable, matchId: matchId });
          setWaitsForCreatingNewMatch(false);
          setKeepsConnectionFromStart(true);
        }
      };
      handleJoinedTable = async (playerAddress: AddressLike, tableId: BigNumberish) => {
        if (isEqual(tableId, currentTable.id) && !isSameAddress(playerAddress, user.playerAddress)) {
          setCurrentTableByTableStruct(await contract.getTable(tableId as never)); // trigger updating `players` list
          // The player already in a table player should also be the host of that table, so would be the one sending offer
          connectOpponentPeerAddress(playerAddress);
          setIsConnectingToPeer(true);
          setFullscreenToastMessage({ message: 'A player has joined', level: 'info' });
        }
      };
      handleUpdatedTable = (table: MysteryChineseChess.TableStructOutput) => {
        if (isEqual(table.id, currentTable.id)) {
          setCurrentTableByTableStruct(table); // trigger updating `players` list
          setFullscreenToastMessage({ message: 'Updated table settings', level: 'success' });
          setWaitsForTransactionalActionMessage(null);
        }
      };
      handleUpdatedTableId = (oldTableId: BigNumberish, newTableId: BigNumberish) => {
        if (isEqual(oldTableId, currentTable.id)) {
          setUserByPlayerStruct({ ...user, tableId: newTableId });
          setCurrentTableByTableStruct({ ...currentTable, id: newTableId });
          console.log("1 table out there had been removed; your table's ID has been updated");
        }
      };
      handleExitedTable = async (playerAddress: AddressLike, tableId: BigNumberish) => {
        if (!isEqual(tableId, currentTable.id)) {
          return;
        }

        console.log('exec exitttttt');
        if (isSameAddress(playerAddress, user.playerAddress)) {
          // If this user had just exited a table
          // console.log("It's you who had exited");
          setUserByPlayerStruct({ ...user, tableId: 0 });
          setCurrentTableByTableStruct(null);
          setWaitsForTransactionalActionMessage(undefined);
          setFullscreenToastMessage({ message: 'Exited table', level: 'info' });
        } else {
          console.log(players);
          const oldOpponent: MysteryChineseChess.PlayerStruct = players.find((player) =>
            isSameAddress(player.playerAddress, playerAddress)
          );

          setCurrentTableByTableStruct(await contract.getTable(tableId as never));
          // console.log('should render notif for oppponent left');

          if (oldOpponent) {
            setFullscreenToastMessage({
              message: `${oldOpponent.playerName} has left`,
              level: 'info',
            });
          }
        }

        if (opponentConnection) {
          connectOpponentPeerAddress(null);
          console.log('Closing peer connection to old opponent');
        }
      };

      contract.on(contract.filters.NewMatchStarted, handleNewMatchStartedEvent);
      contract.on(contract.filters.JoinedTable, handleJoinedTable);
      contract.on(contract.filters.UpdatedTable, handleUpdatedTable);
      contract.on(contract.filters.UpdatedTableId, handleUpdatedTableId);
      contract.on(contract.filters.ExitedTable, handleExitedTable);
      // (async () => console.log('4 new event listeners should be set'))();
    }

    return () => {
      if (contract) {
        // console.log('cleanup table-related listeners');
        // contract.listeners(contract.filters.ExitedTable).then((res) => {
        // console.log('having ' + res.length + ' listeners for ExitedTable event. removing listeners');
        // contract.off(contract.filters.ExitedTable);
        // });
        contract.off(contract.filters.JoinedTable, handleJoinedTable);
        contract.off(contract.filters.UpdatedTable, handleUpdatedTable);
        contract.off(contract.filters.UpdatedTableId, handleUpdatedTableId);
        contract.off(contract.filters.ExitedTable, handleExitedTable);
      }
    };
  }, [
    contract,
    user,
    currentTable,
    isHost,
    opponentConnection,
    players,
    connectOpponentPeerAddress,
    setCurrentTableByTableStruct,
    setUserByPlayerStruct,
    setFullscreenToastMessage,
    setIsConnectingToPeer,
    setWaitsForTransactionalActionMessage,
    setKeepsConnectionFromStart,
  ]);

  useEffect(() => {
    const handleGetStartGameMessage = (data: P2PExchangeMessageInterface) => {
      if (data.type == P2PMessageType.START_GAME) {
        setWaitsForCreatingNewMatch(true);
      }
    };

    opponentConnection?.on('data', handleGetStartGameMessage);

    return () => {
      opponentConnection?.off('data', handleGetStartGameMessage);
    };
  }, [opponentConnection]);

  useEffect(() => {
    if (peerConnectionTimedOut && isHost && !isPositiveBigNumber(currentTable.matchId)) {
      console.log('Auto kick opponent from table due to connection timed out');
      // TODO: implement this contract's function
    }
  }, [currentTable.matchId, isHost, peerConnectionTimedOut]);

  if (!currentTable || isPositiveBigNumber(currentTable.matchId)) {
    return (
      <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
        <div className="relative w-full h-12 justify-self-start">
          <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleExitTable}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" className="my-auto">
            {!currentTable && 'Loading table info...'}
          </Typography>
          {currentTable && isPositiveBigNumber(currentTable.matchId) && 'Return to game...'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleExitTable}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h5" className="my-auto">
          (Rank) {currentTable.name}
        </Typography>
      </div>
      <div className="flex h-full py-2 flex-col justify-between items-center">
        <PlayerTag player={players[0]} isHost={currentTable.hostIndex == 0} />
        <div className="flex h-1/2 flex-col justify-between">
          <div className="flex h-2/3 flex-col justify-center">
            <div className="text-black text-5xl font-normal font-['Asul']">VS</div>
            <div className="text-black text-md">Stake: {currentTable.stake?.toString()}G</div>
          </div>
          {/*Render only with host and when game hasn't been started*/}
          {user &&
            currentTable &&
            !isPositiveBigNumber(currentTable.matchId) &&
            !waitsForCreatingNewMatch &&
            isSameAddress(user.playerAddress, currentTable.players[Number(currentTable.hostIndex)]) && (
              <div className="flex w-[30rem] flex-col items-center space-y-2">
                <Button
                  variant="contained"
                  className="w-1/2 text-black text-xl"
                  onClick={handleStartNewMatch}
                  disabled={
                    !currentTable ||
                    currentTable.players.filter(isNonZeroAddress).length < 2 ||
                    waitsForCreatingNewMatch
                  }
                >
                  Start
                </Button>
                <div className="flex w-full justify-between">
                  <>
                    <div className="w-1/2 mx-auto">
                      <Button
                        variant="outlined"
                        className="text-black text-balance"
                        onClick={handleOpenCloseTableSettings}
                      >
                        Settings
                      </Button>
                    </div>
                    <div className="w-1/2 mx-auto">
                      <Button variant="outlined" className="text-black text-balance" disabled>
                        Kick opponent
                      </Button>
                    </div>
                  </>
                  <Dialog
                    open={opensTableSettings}
                    onClose={handleOpenCloseTableSettings}
                    PaperProps={
                      {
                        component: 'form',
                        onSubmit: onSaveTableSettings,
                      } as Partial<PaperProps<React.ElementType>>
                    }
                  >
                    <DialogTitle>Settings</DialogTitle>
                    <DialogContent>
                      <DialogContentText>Set table information</DialogContentText>
                      <TextField
                        variant="standard"
                        fullWidth
                        margin="dense"
                        required
                        label="Name"
                        type="text"
                        maxRows={1}
                        id="name"
                        name="name"
                        defaultValue={currentTable?.name ?? ''}
                      />
                      <TextField
                        variant="standard"
                        fullWidth
                        margin="dense"
                        required
                        label="Time control"
                        type="number"
                        id="timeControl"
                        name="timeControl"
                        defaultValue={currentTable ? Number(currentTable.timeControl) / 1000 / 60 : null}
                      />
                      <TextField
                        variant="standard"
                        autoFocus
                        fullWidth
                        margin="dense"
                        label="Stake"
                        type="number"
                        id="stake"
                        name="stake"
                        defaultValue={Number(currentTable?.stake)}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleOpenCloseTableSettings}>Cancel</Button>
                      <Button type="submit">Save</Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </div>
            )}
          {user && currentTable /* && isPositiveBigNumber(currentTable.matchId)*/ && waitsForCreatingNewMatch && (
            <div>Be patient, game will be ready in next seconds...</div>
          )}
        </div>
        <PlayerTag player={players[1]} isHost={currentTable.hostIndex == 1} />
      </div>
      {/*<Backdrop sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })} open={exitingTable}>*/}
      {/*  <CircularProgress color="inherit" /> Exiting*/}
      {/*</Backdrop>*/}
    </div>
  );
};

export default RankModeTable;
