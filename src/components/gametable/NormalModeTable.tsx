import React, { useEffect, useState } from 'react';
import { useAuthContext, useGlobalContext } from '../../hooks';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import PlayerTag from './PlayerTag';
import { MysteryChineseChess } from '../../contracts/typechain-types';

const NormalModeTable: React.FC = () => {
  // const [table, setTable] = useState<TableEntity>();
  const [opensStakeSetting, setOpensStakeSetting] = useState<boolean>(false);
  const [opensTableNameSetting, setOpensTableNameSetting] = useState<boolean>(false);
  const [players, setPlayers] = useState<MysteryChineseChess.PlayerStruct[]>([null, null]);
  // const [processor, setProcessor] = useState<Processor>(null);
  const { normalRoomLevel, setNormalRoomLevel, currentTable } = useGlobalContext();
  const { contract, user } = useAuthContext();

  useEffect(() => {
    if (currentTable) {
      (async function() {
        const players: MysteryChineseChess.PlayerStruct[] = [null, null];

        for (let i = 0; i < currentTable.players.length; i++) {
          const address = currentTable.players[i];

          if (BigInt(address as string) == BigInt(0)) {
            continue;
          }

          if (user.playerAddress == address) {
            players[i] = user;
          } else {
            players[i] = await contract.getPlayer(address as never);
          }
        }

        setPlayers(players);
      })();
    } else {
      setPlayers([]);
    }
  }, [currentTable]);

  const handleBackButton = () => {
    if (!normalRoomLevel) {
      return;
    }

    if (currentTable != null) {
      // setTable(null);
    } else {
      setNormalRoomLevel(null); // redundant
    }
  };

  const handleOpenStakeSetting = () => {
    setOpensStakeSetting(!opensStakeSetting);
  };

  const handleOpenTableNameSetting = () => {
    setOpensTableNameSetting(!opensTableNameSetting);
  };

  const handleStartNewMatch = () => {
    // Send various APIs: update states of players, create new match, update state of table
    // setTable((prev) => ({ ...prev, matchId: 1 }));
  };

  if (!currentTable) {
    return (
      <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
        <div className="relative w-full h-12 justify-self-start">
          <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" className="my-auto">Loading table info...</Typography>
        </div>
      </div>
    );
  }

  if (currentTable.matchId) {
    return (
      <div>Return to game...</div>
    );
  }
  return (
    <div className="flex h-2/3 border-2 border-solid border-black rounded-2xl flex-col text-blue-950">
      <div className="relative w-full h-12 justify-self-start">
        <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Typography variant="h5"
                    className="my-auto">{normalRoomLevel && normalRoomLevel.name.toUpperCase() + ' - '}{currentTable.name}</Typography>
      </div>
      <div className="flex h-full py-2 flex-col justify-between items-center">
        <PlayerTag player={players[0]} isHost={currentTable.hostIndex == 0} />
        <div className="flex h-1/2 flex-col justify-between">
          <div className="flex h-2/3 flex-col justify-center">
            <div className="text-black text-5xl font-normal font-['Asul']">VS</div>
            <div className="text-black text-md">Stake: {currentTable.stake?.toString()}G</div>
          </div>
          <div className="flex w-[30rem] flex-col items-center space-y-2">
            <Button variant="contained" className="w-1/2 text-black text-xl" onClick={handleStartNewMatch}>
              Start
            </Button>
            <div className="flex w-full justify-between">
              <div className="w-1/2 mx-auto">
                <Button variant="outlined" className="text-black text-balance" onClick={handleOpenStakeSetting}>
                  Set stake
                </Button>
              </div>
              <div className="w-1/2 mx-auto">
                <Button variant="outlined" className="text-black text-balance" onClick={handleOpenTableNameSetting}>
                  Rename table
                </Button>
              </div>
              <div className="w-1/2 mx-auto">
                <Button variant="outlined" className="text-black text-balance">Kick</Button>
              </div>
              <Dialog
                open={opensStakeSetting}
                onClose={handleOpenStakeSetting}
                PaperProps={{
                  component: 'form',
                  onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    console.log('submitted');
                    event.preventDefault();
                  },
                }}
              >
                <DialogTitle>Set new stake</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Stake must be larger or equal to 1G
                  </DialogContentText>
                  <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="stake"
                    name="stake"
                    label="Stake"
                    type="number"
                    fullWidth
                    variant="standard"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleOpenStakeSetting}>Cancel</Button>
                  <Button type="submit">Ok</Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={opensTableNameSetting}
                onClose={handleOpenTableNameSetting}
                PaperProps={{
                  component: 'form',
                  onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    console.log('submitted');
                    event.preventDefault();
                  },
                }}
              >
                <DialogTitle>Set new table name</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Table name must have length in range 1-50 characters
                  </DialogContentText>
                  <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="table-name"
                    name="table-name"
                    label="Table name"
                    type="text"
                    fullWidth
                    variant="standard"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleOpenTableNameSetting}>Cancel</Button>
                  <Button type="submit">Ok</Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
        <PlayerTag player={players[1]} isHost={currentTable.hostIndex == 1} />
      </div>
    </div>
  );
};

export default NormalModeTable;
