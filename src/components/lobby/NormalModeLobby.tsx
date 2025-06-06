import React, { useCallback, useEffect, useState } from 'react';
import {
  Button,
  IconButton,
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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { useAuthContext, useGlobalContext } from '../../hooks';
import { NormalRoomLevel } from '../../constants';
import { type BigNumberish } from 'ethers';
import { InLobbyTableData, type Column } from '../gametable';

// import {Peer} from "https://esm.sh/peerjs@1.5.4?bundle-deps"

const columns: readonly Column[] = [
  { id: 'id', label: 'ID', minWidth: 20, align: 'center' },
  { id: 'name', label: 'Name', minWidth: 170, align: 'center' },
  { id: 'filledSlots', label: 'Slots', minWidth: 20, align: 'center' },
  { id: 'spectators', label: 'Spectators', minWidth: 30, align: 'center' },
  { id: 'stake', label: 'Stake', minWidth: 170, align: 'center', format: (value: number) => value.toFixed(10) },
];

type Props = object;

// const NormalModeLobby: React.FC<Props> = () => {
//   const [gameTableList, setGameTableList] = useState<Array<InLobbyTableData>>([]);
//   const [selectedTableId, setSelectedTableId] = useState<BigNumberish>(0);
//   const { normalRoomLevel, setNormalRoomLevel, currentTable } = useGlobalContext();
//   const { contract } = useAuthContext();
//
//   const handleBackButton = () => {
//     if (!normalRoomLevel) {
//       return;
//     }
//
//     if (currentTable != null) {
//       // setTable(null); // redundant
//     } else {
//       setNormalRoomLevel(null);
//     }
//   };
//
//   const handleSelectRoomLevel = useCallback((roomLevel: NormalRoomLevel) => {
//     setNormalRoomLevel(roomLevel);
//   }, [setNormalRoomLevel]);
//
//   const handleEnterRoom = useCallback((gameTable: InLobbyTableData) => {
//     if (gameTable.filledSlots == 2) {
//       alert('The selected table is full. You can be spectator or select another room.');
//       return;
//     }
//
//     // Send API to request to fetch the selected table's detail info and then update DOM
//     setSelectedTableId(gameTable.id);
//   }, []);
//
//   useEffect(() => {
//     // Fetch table list
//     if (typeof normalRoomLevel !== 'undefined' && normalRoomLevel !== null) {
//       (async function() {
//         const list: InLobbyTableData[] = (await contract.getAllTables(BigInt(2 + normalRoomLevel.number) as never, 1 as never, 10 as never))
//           .filter((t) => Number(t.id) != 0)
//           .map((t) => new InLobbyTableData(t));
//
//         console.log('converted data');
//         console.log(list);
//         setGameTableList(list);
//         // setGameTableList([
//         //   new GameTable(1, 'n0', 0, 0, 0, false),
//         //   new GameTable(2, 'n098', 1, 0.2241, 1, false),
//         //   new GameTable(3, 'n234', 2, 1.4513, 19, true),
//         //   new GameTable(4, 'n565', 1, 0.09419, 3, false),
//         //   new GameTable(5, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(7, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(8, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(9, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(10, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
//         //   new GameTable(6, 'nhtr', 1, 2.10193, 0, false),
//         // ]);
//
//       })();
//     }
//
//     return () => {
//       setGameTableList([]);
//     };
//   }, [normalRoomLevel, setGameTableList, contract]);
//
//   // Send API to request to fetch the selected table's detail info and then update DOM
//   useEffect(() => {
//     if (selectedTableId > 0) {
//       // setTable({
//       //   id: selectedTableId,
//       //   // gameMode: GameMode,
//       //   name: '',
//       //   players: [
//       //     { address: '0x11111', name: 'namng108', elo: 270 },
//       //     { address: '0x9999999', name: 'Henry', elo: 220 },
//       //   ], // should be accessed using the constants 'BLACK', 'RED'
//       //   hostIndex: 0,
//       //   stake: 0,
//       //   timeControl: 20 * 3600,
//       //   matchId: undefined,
//       // });
//
//       setSelectedTableId(null);
//     }
//   }, [selectedTableId]);
//
//   return (
//     <div
//       className={`flex min-h-40 h-4/5 2xl:h-3/4 ${normalRoomLevel && 'border-2 border-solid border-black'} rounded-lg flex-col text-blue-950`}>
//       {normalRoomLevel ? (
//         <>
//           <div className="relative w-full h-12 justify-self-start">
//             <IconButton className="block absolute left-0 top-0 w-1/10 my-auto" onClick={handleBackButton}>
//               <ArrowBackRoundedIcon />
//             </IconButton>
//             <Typography variant="h5" className="my-auto">{normalRoomLevel.name}</Typography>
//           </div>
//           <Paper className="w-full overflow-hidden">
//             <TableContainer className="h-full">
//               <Table stickyHeader aria-label="sticky table">
//                 <TableHead>
//                   <TableRow>
//                     {columns.map((column, i) => (
//                       <TableCell
//                         key={i}
//                         align={column.align}
//                         style={{ minWidth: column.minWidth }}
//                       >
//                         {column.id === 'id' ? '' : column.label}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {gameTableList //.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                     .map((gameTableData, i) => {
//                       return (
//                         <TableRow hover role="checkbox" tabIndex={-1} key={i}
//                                   className={`${gameTableData.started ? 'bg-blue-gray-500' : ''}`}
//                                   onClick={() => handleEnterRoom(gameTableData)}
//                         >
//                           {columns.map((column) => {
//                             const value = gameTableData[column.id];
//
//                             return (
//                               <TableCell key={column.id} align={column.align}>
//                                 {column.format && typeof value === 'number' ?
//                                   column.format(value)
//                                   :
//                                   (column.id === 'filledSlots') ?
//                                     `${value.toString()}/2`
//                                     :
//                                     value.toString()}
//                               </TableCell>
//                             );
//                           })}
//                         </TableRow>
//                       );
//                     })}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             {/*<TablePagination*/}
//             {/*  rowsPerPageOptions={[10, 25, 100]}*/}
//             {/*  component="div"*/}
//             {/*  count={tables.length}*/}
//             {/*  rowsPerPage={rowsPerPage}*/}
//             {/*  page={page}*/}
//             {/*  onPageChange={handleChangePage}*/}
//             {/*  onRowsPerPageChange={handleChangeRowsPerPage}*/}
//             {/*/>*/}
//           </Paper>
//         </>
//       ) : (
//         <div className="flex grow row-start-2 flex-col justify-center space-y-4">
//           <Button
//             variant="contained"
//             color="success"
//             className="p-4 rounded-lg shadow-md text-center"
//             onClick={() => handleSelectRoomLevel(NormalRoomLevel.BEGINNER)}>
//             <p className="font-semibold text-lg">Beginner room</p>
//           </Button>
//           <Button
//             variant="contained"
//             color="success"
//             className="p-4 rounded-lg shadow-md text-center"
//             onClick={() => handleSelectRoomLevel(NormalRoomLevel.INTERMEDIATE)}>
//             <p className="font-semibold text-lg">Intermediate room</p>
//           </Button>
//           <Button
//             variant="contained"
//             color="success"
//             className="p-4 rounded-lg shadow-md text-center"
//             onClick={() => handleSelectRoomLevel(NormalRoomLevel.ADVANCED)}>
//             <p className="font-semibold text-lg">Advanced room</p>
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// };
const NormalModeLobby: React.FC<Props> = () => null;
export default NormalModeLobby;