import { useAuthContext, useGlobalContext, useInTableContext, usePeerContext } from '../../hooks';
import { MysteryChineseChess } from '../../contracts/typechain-types';
import { useCallback, useEffect, useState } from 'react';
import { XiangqiBoard } from '../xiangqiboard';
import { Divider, IconButton, TextField, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { isBlank, isPositiveBigNumber } from '../../utilities';
import { ChatMessage, P2PExchangeMessageInterface, P2PMessageType } from '../../p2pExchangeMessage.ts';
import { type BigNumberish } from 'ethers';
import { pieceImageMappings } from '../../constants';
import { Web3MysteryXiangqiProcessor } from '../xiangqiboard/processor';
import { PieceColor } from '../../contracts/abi';

const InGameScreen: React.FC = () => {
  const [processor, setProcessor] = useState<Web3MysteryXiangqiProcessor>();
  const [moves, setMoves] = useState<MysteryChineseChess.MoveStruct[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [insertedMessage, setInsertedMessage] = useState<string>();
  const { currentTable, setFullscreenToastMessage } = useGlobalContext();
  const { user } = useAuthContext();
  const { opponentConnection } = usePeerContext();
  const { players, connectedToOpponent } = useInTableContext();

  // const convertPlayerIndexToName = useCallback(
  //   (index: number): string | undefined => {
  //     if (!players || players.length != 2) return;
  //
  //     return players[index]?.playerName;
  //   },
  //   [players]
  // );

  const handleSendMessage = useCallback(() => {
    if (isBlank(insertedMessage)) {
      setFullscreenToastMessage({ message: 'Insert message first!', level: 'error' });
    } else if (connectedToOpponent) {
      const chatMessage: ChatMessage = {
        sender: user.playerName,
        content: insertedMessage,
        timestamp: Date.now(),
      };

      opponentConnection.send({
        type: P2PMessageType.CHAT,
        data: chatMessage,
      } satisfies P2PExchangeMessageInterface);

      setChatMessages((prev) => [...prev, chatMessage]);
      setInsertedMessage(null);
    } else {
      setFullscreenToastMessage({
        message: 'Connection to opponent is corrupted. Cannot send message',
        level: 'error',
      });
    }
  }, [connectedToOpponent, insertedMessage, opponentConnection, setFullscreenToastMessage, user?.playerName]);

  useEffect(() => {
    const handleReceivedChatMessage = (message: P2PExchangeMessageInterface) => {
      if (message.type == P2PMessageType.CHAT) {
        setChatMessages((prev) => [...prev, message.data as ChatMessage]);
      }
    };

    opponentConnection?.on('data', handleReceivedChatMessage);

    return () => {
      opponentConnection?.off('data', handleReceivedChatMessage);
    };
  }, [opponentConnection]);

  if (!currentTable || !isPositiveBigNumber(currentTable.matchId)) {
    return;
  }

  return (
    <div className="flex w-full">
      <div className="w-2/3 min-w-[670px] h-full">
        <XiangqiBoard processor={processor} setProcessor={setProcessor} moves={moves} setMoves={setMoves} />
      </div>

      <div className="flex w-1/3 flex-grow flex-col items-center space-y-2">
        <div className="w-full h-1/2 px-6 pb-6">
          <div className="h-full border-solid border-2 border-black rounded-2xl">
            <Typography variant="h5" align="center">
              History
            </Typography>
            <Divider className="w-full bg-black" />
            {moves?.length > 0 &&
              processor?.getHistory().map(
                (historyRecord, index) =>
                  index < moves.length && (
                    <div key={index} className="text-left ml-2">
                      <span className="text-sm">{timestampToTime(moves[index].details.timestamp)} - </span>
                      {/*<span className="text-md font-bold text-black">*/}
                      {/*  {convertPlayerIndexToName(Number(move.details.playerIndex))}*/}
                      {/*</span>*/}
                      <div
                        className="inline-block relative top-2 w-8 h-8 rounded-full box-border"
                        style={{
                          boxShadow:
                            'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                          backgroundColor: `${historyRecord.sourcePlayerPiece?.color == PieceColor.RED ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                        }}
                      >
                        {historyRecord.sourcePlayerPiece?.unfolded && (
                          <img
                            src={pieceImageMappings.get(historyRecord.sourcePlayerPiece?.piece)}
                            alt="piece"
                            className="inline-block absolute inset-[15%] w-2/3 h-2/3"
                          />
                        )}
                      </div>{' '}
                      {historyRecord.sourcePlayerPiece && !historyRecord.sourcePlayerPiece.unfolded && (
                        <div
                          className="inline-block relative top-2 w-8 h-8 rounded-full box-border"
                          style={{
                            boxShadow:
                              'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                            backgroundColor: `${historyRecord.sourcePlayerPiece?.color == PieceColor.RED ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                          }}
                        >
                          <img
                            src={pieceImageMappings.get(historyRecord.sourcePlayerPiece.piece)}
                            alt="piece"
                            className="inline-block absolute inset-[15%] w-2/3 h-2/3"
                          />
                        </div>
                      )}
                      <span className="text-sm font-bold"> {positionToString(historyRecord.oldPosition)} </span>={'>'}
                      <span className="text-sm font-bold"> {positionToString(historyRecord.newPosition)} </span>
                      {historyRecord.targetPlayerPiece && (
                        <div
                          className="inline-block relative top-2 w-8 h-8 rounded-full box-border"
                          style={{
                            boxShadow:
                              'rgba(0, 0, 0, 0.1) 4px 4px 5px, rgba(255, 255, 255, 0.3) 0px 4px 2px 0px inset, rgba(0, 0, 0, 0.3) 0px -3px 2px 0px inset',
                            backgroundColor: `${historyRecord.targetPlayerPiece?.color == PieceColor.RED ? 'rgb(187,16,6)' : 'rgb(31,31,31)'}`,
                          }}
                        >
                          {historyRecord.targetPlayerPiece.unfolded && (
                            <img
                              src={pieceImageMappings.get(historyRecord.targetPlayerPiece.piece)}
                              alt="piece"
                              className="inline-block absolute inset-[15%] w-2/3 h-2/3"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )
              )}
          </div>
        </div>

        <div className="w-full h-1/2 px-6 pt-6">
          <div className="h-full border-solid border-2 border-black rounded-2xl">
            <Typography variant="h5" align="center" className="h-[7.5%] min-h-6">
              Chat
            </Typography>
            <Divider className="w-full bg-black" />
            <div className="h-[77.5%] min-h-28 px-2">
              {chatMessages.map((message: ChatMessage, index) => (
                <div key={index} className="text-left">
                  <span className="text-md font-bold">{message.sender}</span>
                  <span className="text-sm text-gray-400"> ({timestampToTime(message.timestamp)})</span>:
                  <span className="text-sm text-black"> {message.content}</span>
                </div>
              ))}
            </div>
            <div className="flex w-full h-[15%] min-h-6 space-x-2 items-center">
              <TextField
                id="outlined-multiline-flexible"
                placeholder="Enter message..."
                multiline
                maxRows={3}
                className="flex-auto w-4/5 ml-2 my-2"
                onChange={(event) => setInsertedMessage(event.target.value)}
                onPaste={(event) => setInsertedMessage(event.clipboardData.getData('text'))}
                value={insertedMessage ?? ''}
              />
              <IconButton
                className={`flex-none w-12 ${isBlank(insertedMessage) ? 'bg-gray-300' : 'bg-cyan-950'} rounded-full`}
                onClick={handleSendMessage}
                disabled={isBlank(insertedMessage)}
              >
                <SendIcon sx={{ color: 'white' }} />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InGameScreen;

function timestampToTime(timestamp: BigNumberish): string {
  const datetime = new Date(Number(timestamp));

  return `${datetime.getHours().toString().padStart(2, '0')}:${datetime.getMinutes().toString().padStart(2, '0')}:${datetime.getSeconds().toString().padStart(2, '0')}`;
}

function positionToString(position: MysteryChineseChess.PositionStruct) {
  return `${String.fromCharCode(65 + Number(position.y))}${Number(position.x) + 1}`;
}
