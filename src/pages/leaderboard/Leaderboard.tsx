import PageContainer from '../../components/PageContainer.tsx';
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks';
import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  type TableCellProps,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import defaultAvatar from '../../assets/default-avatar.svg';
import { isNonZeroAddress } from '../../utilities';

type Column = TableCellProps & {
  id: 'rank' | keyof MysteryChineseChess.PlayerStruct;
  label: string;
  minWidth: number;
};

const columns: readonly Column[] = [
  { id: 'rank', label: 'Rank', minWidth: 20, align: 'center' },
  { id: 'playerName', label: 'Player', minWidth: 170, align: 'center' },
  { id: 'elo', label: 'Elo', minWidth: 20, align: 'center' },
];

const Leaderboard: React.FC = () => {
  const [rankingList, setRankingList] = useState<MysteryChineseChess.PlayerStruct[]>([]);
  const { contract } = useAuthContext();

  useEffect(() => {
    if (contract) {
      (async function () {
        const list = (await contract.getAllPlayers())
          .map((e) => e)
          .sort((a, b) => {
            const firstElo: number = Number(a.elo);
            const secondElo: number = Number(b.elo);

            return firstElo < secondElo ? 1 : firstElo > secondElo ? -1 : 0;
          })
          .slice(0, 20) // get top 20 players
          .filter((player) => isNonZeroAddress(player.playerAddress));
        console.log(list);
        setRankingList(list);
      })();
    }
  }, [contract]);

  return (
    <PageContainer>
      <div className="h-20"></div>
      <Box
        sx={{ width: '100%', maxWidth: 966, margin: 'auto', padding: 2 }}
        className="flex flex-col items-center space-y-4"
      >
        <Box width={500} className="h-40">
          <Typography
            variant="h1"
            sx={{
              // position: "fixed",
              // top: 0,
              // left: 0,
              // fontFamily: "'Battambang-Regular', Helvetica",
              fontWeight: 'normal',
              color: 'black',
              fontSize: '60px',
              letterSpacing: 0,
              lineHeight: 'normal',
            }}
          >
            Season: 9
          </Typography>
          <Typography variant="subtitle1" align="center" gutterBottom>
            (Terminate in 2 months 27 days)
          </Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{
            // position: "fixed",
            // top: 0,
            // left: 0,
            // fontFamily: "'Baskervville_SC-Regular', Helvetica",
            fontWeight: 'normal',
            color: 'black',
            fontSize: 50,
            letterSpacing: 0,
            lineHeight: 'normal',
          }}
        >
          Ranking table
        </Typography>
        <div className="w-full max-w-4xl mt-10">
          <TableContainer component={Paper} className="rounded-lg shadow-lg">
            <Table>
              {/* Table Header */}
              <TableHead>
                <TableRow className="bg-gray-700">
                  {columns.map((column) => (
                    <TableCell align={column.align} className="min-w-5 text-white font-bold">
                      {column.label}
                    </TableCell>
                  ))}
                  {/*<TableCell className="text-white font-bold">Player</TableCell>*/}
                  {/*<TableCell className="text-white font-bold">Elo</TableCell>*/}
                </TableRow>
              </TableHead>
              {/* Table Body */}
              <TableBody>
                {rankingList.map((player, index) => (
                  <TableRow
                    key={index}
                    className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-gray-100'} hover:bg-gray-300 transition-all`}
                  >
                    <TableCell align="center">{index}</TableCell>
                    <TableCell align="center" className="flex items-center space-x-3">
                      <Avatar src={defaultAvatar} alt={player.playerName} />
                      <span className="text-md font-medium">
                        {player.playerName}{' '}
                        <span className="text-gray-500 text-sm">({player.playerAddress.toString()})</span>
                      </span>
                    </TableCell>
                    <TableCell align="center">{player.elo.toString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </Box>
    </PageContainer>
  );
};

export default Leaderboard;
