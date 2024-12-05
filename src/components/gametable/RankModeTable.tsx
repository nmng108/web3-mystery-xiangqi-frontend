import React, { useCallback, useEffect, useState } from 'react';
import { useAuthContext, useGlobalContext, useWalletProviderContext } from '../../hooks';
import {
  Backdrop,
  Button,
  CircularProgress,
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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PlayerTag from './PlayerTag';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import { isEqual, isNonZeroAddress, isPositiveBigNumber, isSameAddress } from '../../utilities';
import { ContractError } from '../../contracts/abi';

type Props = {
  setWaitForTransactionalActionMessage: React.Dispatch<React.SetStateAction<string>>;
};

const RankModeTable: React.FC<Props> = ({ setWaitForTransactionalActionMessage }) => {
  const [opensTableSettings, setOpensTableSettings] = useState<boolean>(false);
  const [exitingTable, setExitingTable] = useState<boolean>(false);
  const [players, setPlayers] = useState<MysteryChineseChess.PlayerStruct[]>([null, null]);
  const [waitsForCreatingNewMatch, setWaitsForCreatingNewMatch] = useState<boolean>(false);
  const { disconnectWallet } = useWalletProviderContext();
  const { currentTable, setCurrentTableByTableStruct, setFullscreenToastMessage } =
    useGlobalContext();
  const { contract, user, setUserByPlayerStruct } = useAuthContext();

  const handleExitTable = useCallback(() => {
    if (currentTable && user) {
      try {
        setExitingTable(true);
        contract.exitTable(currentTable.id as never);
      } catch (err) {
        if ('message' in err) {
          setFullscreenToastMessage({ message: err.message, level: 'error' });
          console.log(err.message);
        }
      }
    }
  }, [contract, user, currentTable, setCurrentTableByTableStruct, setFullscreenToastMessage]);

  const handleOpenTableSettings = useCallback(() => {
    setOpensTableSettings(!opensTableSettings);
  }, [opensTableSettings]);

  const onSaveTableSettings = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      type FormJson = { name: string; timeControl: number; stake: number };
      const formJson: FormJson = Object.fromEntries(
        new FormData(event.currentTarget).entries()
      ) as unknown as FormJson;
      const name: string = formJson.name;
      const timeControl: number = formJson.timeControl;
      const stake: number = formJson.stake;
      const newTableSettings: MysteryChineseChess.TableStruct = {
        ...currentTable,
        name: name,
        timeControl: timeControl * 60 * 1000,
        stake: stake || 0,
      };

      console.log(newTableSettings);
      contract.updateTable(newTableSettings as never);
    },
    [contract, currentTable]
  );

  const handleStartNewMatch = useCallback(async () => {
    if (!currentTable) {
      return;
    }

    try {
      setWaitsForCreatingNewMatch(true);
      // Update states of players, create new match, update state of table
      await contract.startNewMatch(currentTable.id as never);
      contract.on(contract.filters.NewMatchStarted, (matchId, playerIds) => {
        if (playerIds.find(user.playerAddress.toString)) {
          contract.off(contract.filters.NewMatchStarted);
          setCurrentTableByTableStruct({ ...currentTable, matchId: matchId });
          setWaitsForCreatingNewMatch(false);
        }
      });
    } catch (err) {
      setWaitsForCreatingNewMatch(false);

      if (err.revert?.name == ContractError.InvalidAction) {
        disconnectWallet();
        return;
      }

      const message =
        err.revert?.name == ContractError.InvalidAction ? err.revert.message : err.message;
      setFullscreenToastMessage({ message: message, level: 'error', duration: 3000 });
    }
  }, [contract, currentTable, setCurrentTableByTableStruct]);

  // Set contract's event listeners relating to table
  useEffect(() => {
    console.log('create & assign listeners');
    let handleJoinedTable;
    let handleUpdatedTable;
    let handleUpdatedTableId;
    let handleExitedTable;

    if (contract && currentTable) {
      handleJoinedTable = async (playerAddress, tableId) => {
        if (
          isEqual(tableId, currentTable.id) &&
          !isSameAddress(playerAddress, user.playerAddress)
        ) {
          setCurrentTableByTableStruct(await contract.getTable(tableId as never)); // trigger updating `players` list
          setFullscreenToastMessage({ message: 'A player has joined', level: 'info' });
        }
      };
      handleUpdatedTable = (table) => {
        if (isEqual(table.id, currentTable.id)) {
          setCurrentTableByTableStruct(table); // trigger updating `players` list
          setFullscreenToastMessage({ message: 'Updated table settings', level: 'success' });
        }
      };
      handleUpdatedTableId = (oldTableId, newTableId) => {
        if (isEqual(oldTableId, currentTable.id)) {
          setUserByPlayerStruct({ ...user, tableId: newTableId });
          setCurrentTableByTableStruct({ ...currentTable, id: newTableId });
        }
      };
      handleExitedTable = async (playerAddress, tableId) => {
        console.log('caught ExitedTable event');
        if (!isEqual(tableId, currentTable.id)) {
          return;
        }
        console.log('exec exitttttt');
        if (isSameAddress(playerAddress, user.playerAddress)) {
          console.log("It's you who has exited");
          setExitingTable(false);
          setUserByPlayerStruct({ ...user, tableId: 0 });
          setCurrentTableByTableStruct(null);
          setFullscreenToastMessage({ message: 'Exited table', level: 'success' });
        } else {
          console.log(players);
          const oldOpponent: MysteryChineseChess.PlayerStruct = players.find((player) =>
            isSameAddress(player.playerAddress, playerAddress)
          );
          setCurrentTableByTableStruct(await contract.getTable(tableId as never));
          console.log('should render notif for oppponent left');

          if (oldOpponent) {
            setFullscreenToastMessage({
              message: `${oldOpponent.playerName} has left`,
              level: 'info',
            });
          }
        }
      };

      contract.on(contract.filters.JoinedTable, handleJoinedTable);
      contract.on(contract.filters.UpdatedTable, handleUpdatedTable);
      contract.on(contract.filters.UpdatedTableId, handleUpdatedTableId);
      contract.on(contract.filters.ExitedTable, handleExitedTable);
      (async () => console.log('4 new event listeners should been set'))();
    }

    return () => {
      if (contract) {
        // console.log('cleanup listeners');
        contract.listeners(contract.filters.ExitedTable).then((res) => {
          console.log(
            'having ' + res.length + ' listeners for ExitedTable event. removing listeners'
          );
          // contract.off(contract.filters.ExitedTable);
        });
        contract.off(contract.filters.JoinedTable, handleJoinedTable);
        contract.off(contract.filters.UpdatedTable, handleUpdatedTable);
        contract.off(contract.filters.UpdatedTableId, handleUpdatedTableId);
        contract.off(contract.filters.ExitedTable, handleExitedTable);
      }
    };
  }, [contract, currentTable, players]);

  // Set player information to be rendered
  useEffect(() => {
    if (currentTable) {
      (async function () {
        const players: MysteryChineseChess.PlayerStruct[] = [null, null];

        for (let i = 0; i < currentTable.players.length; i++) {
          const address = currentTable.players[i];

          if (!isNonZeroAddress(address)) {
            continue;
          }

          if (isSameAddress(user.playerAddress, address)) {
            players[i] = user;
          } else {
            players[i] = await contract.getPlayer(address as never).catch((err) => {
              if (err.revert?.name == ContractError.ResourceNotFound) {
                setFullscreenToastMessage({
                  message: 'Failed to retrieve opponent information',
                  level: 'error',
                });
              } else {
                console.error(err);
              }

              return null;
            });
          }
        }

        setPlayers(players);
      })();
    } else {
      setPlayers([]);
    }
  }, [contract, user, currentTable]);

  if (!currentTable) {
    return (
      <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
        <div className="relative w-full h-12 justify-self-start">
          <IconButton
            className="block absolute left-0 top-0 w-1/10 my-auto"
            onClick={handleExitTable}
          >
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" className="my-auto">
            Loading table info...
          </Typography>
        </div>
      </div>
    );
  }

  if (currentTable.matchId) {
    return <div>Return to game...</div>;
  }

  return (
    <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton
          className="block absolute left-0 top-0 w-1/10 my-auto"
          onClick={handleExitTable}
        >
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
            isSameAddress(
              user.playerAddress,
              currentTable.players[Number(currentTable.hostIndex)]
            ) && (
              <div className="flex w-[30rem] flex-col items-center space-y-2">
                <Button
                  variant="contained"
                  className="w-1/2 text-black text-xl"
                  onClick={handleStartNewMatch}
                >
                  Start
                </Button>
                <div className="flex w-full justify-between">
                  <>
                    <div className="w-1/2 mx-auto">
                      <Button
                        variant="outlined"
                        className="text-black text-balance"
                        onClick={handleOpenTableSettings}
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
                    onClose={handleOpenTableSettings}
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
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleOpenTableSettings}>Cancel</Button>
                      <Button type="submit">Ok</Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </div>
            )}
          {user &&
            currentTable &&
            isPositiveBigNumber(currentTable.matchId) &&
            waitsForCreatingNewMatch && (
              <div>Be patient, game will be ready in next seconds...</div>
            )}
        </div>
        <PlayerTag player={players[1]} isHost={currentTable.hostIndex == 1} />
      </div>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={exitingTable}
      >
        <CircularProgress color="inherit" /> Exiting
      </Backdrop>
    </div>
  );
};

export default RankModeTable;
