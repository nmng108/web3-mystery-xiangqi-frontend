import { PageContainer } from '../../components';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Backdrop, Button, ButtonGroup, CircularProgress, Snackbar } from '@mui/material';
import BotModeSelector from './BotModeSelector.tsx';
import NormalModeLobby from '../../components/lobby/NormalModeLobby.tsx';
import useGlobalContext from '../../hooks/useGlobalContext.ts';
import RankModeLobby from '../../components/lobby/RankModeLobby.tsx';
import { useAuthContext } from '../../hooks';
import { ContractError } from '../../contracts/abi';
import { isPositiveBigNumber, isSameAddress } from '../../utilities';
import { InTableContextProvider } from '../../context';
import InGameScreen from '../../components/ingamescreen/InGameScreen.tsx';

enum GameMode {
  None,
  BOT = 1,
  NORMAL = 2,
  RANK = 5,
}

const Home: React.FC = () => {
  const [activeMode, setActiveMode] = useState<GameMode>(GameMode.RANK);
  const [userAndCurrentTableLoadingMessage, setUserAndCurrentTableLoadingMessage] = useState<string>();
  const {
    currentTable,
    setCurrentTableByTableStruct,
    fullscreenToastMessage,
    setFullscreenToastMessage,
    waitsForTransactionalActionMessage,
    setWaitsForTransactionalActionMessage,
  } = useGlobalContext();
  // const { selectedAccount } = useWalletProviderContext();
  const { contract, user, setUserByPlayerStruct } = useAuthContext();

  const handleCloseToastMessage = useCallback(() => {
    setFullscreenToastMessage(undefined);
  }, [setFullscreenToastMessage]);

  // [Logic] Try re-entering the last table if coming back
  useEffect(() => {
    // Assure that this code block cannot be executed when user exits a table
    if (contract && isPositiveBigNumber(user?.tableId) && !currentTable) {
      (async function () {
        const table = await contract.getTable(user.tableId as never).catch((err) => {
          console.log(err); // why always get this error in case where user.tableId haven't set to 0 but he had explicitly exited table before?
          const message =
            err.revert?.name == ContractError.ResourceNotFound
              ? 'Not found the last joined table. Back to lobby.'
              : err.message;

          setFullscreenToastMessage({ message: message, level: 'error' });
          setCurrentTableByTableStruct(null);
          setUserByPlayerStruct({ ...user, tableId: 0 });

          return null;
        });

        if (!table) {
          setWaitsForTransactionalActionMessage('Exiting from old table');

          await contract.updatePlayer('' as never, 0 as never, true as never);
          contract.on(contract.filters.UpdatedPlayerInfo, (playerAddress) => {
            if (isSameAddress(playerAddress, user.playerAddress)) {
              contract.off(contract.filters.UpdatedPlayerInfo);
              setWaitsForTransactionalActionMessage(undefined);
              console.log('set tableId = 0 successfully via updatePlayer function');
            }
          });
        }
        console.log('found table: ', table);
        setCurrentTableByTableStruct(table);
      })();
    }
  }, [contract, user, currentTable, setCurrentTableByTableStruct, setFullscreenToastMessage, setUserByPlayerStruct]);

  // [GUI] Show loading icon & prevent user from interacting with table list
  // while loading user's info and current table's info (if user has accessed a table before).
  useEffect(() => {
    setUserAndCurrentTableLoadingMessage(
      !contract || !user
        ? 'Loading user information...'
        : isPositiveBigNumber(user.tableId) && !currentTable
          ? 'Entering table...'
          : undefined
    );
  }, [contract, user, currentTable]);

  const Lobby: () => React.JSX.Element | null = useCallback(() => {
    switch (activeMode) {
      case GameMode.BOT:
        return <BotModeSelector />;
      case GameMode.NORMAL:
        return <NormalModeLobby />;
      case GameMode.RANK:
        return <RankModeLobby rendersLoadingPage={!userAndCurrentTableLoadingMessage} />;
      default:
        return null;
    }
  }, [activeMode, userAndCurrentTableLoadingMessage]);

  return (
    <PageContainer>
      <div className="flex h-full flex-col space-y-4">
        <div className="h-16"></div>
        {/* Game Mode Selector */}
        {!isPositiveBigNumber(currentTable?.matchId) && (
          <div className="flex h-8 xl:h-12 2xl:h-16 justify-center items-center">
            {!currentTable && (
              <ButtonGroup variant="outlined" className="flex w-1/2 min-h-min h-full rounded-2xl items-stretch">
                <Button
                  variant={activeMode === GameMode.BOT ? 'contained' : 'outlined'}
                  className={`block flex-1 font-semibold`}
                  onClick={() => setActiveMode(GameMode.BOT)}
                  disabled
                >
                  Bot
                </Button>
                <Button
                  variant={activeMode === GameMode.NORMAL ? 'contained' : 'outlined'}
                  className={`block flex-1 font-semibold`}
                  onClick={() => setActiveMode(GameMode.NORMAL)}
                  disabled
                >
                  Normal
                </Button>
                <Button
                  variant={activeMode === GameMode.RANK ? 'contained' : 'outlined'}
                  className={`block flex-1 font-semibold`}
                  onClick={() => setActiveMode(GameMode.RANK)}
                >
                  Rank
                </Button>
              </ButtonGroup>
            )}
          </div>
        )}
        <InTableContextProvider>
          <Lobby />
          <InGameScreen />
        </InTableContextProvider>
      </div>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        // TransitionComponent={(props: SlideProps) => (<Slide {...props} direction="down" />)}
        autoHideDuration={fullscreenToastMessage?.duration ?? 2000}
        open={!!fullscreenToastMessage}
        onClose={handleCloseToastMessage}
      >
        <Alert severity={fullscreenToastMessage?.level}>{fullscreenToastMessage?.message}</Alert>
      </Snackbar>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={!!waitsForTransactionalActionMessage || !!userAndCurrentTableLoadingMessage}
      >
        <CircularProgress color="inherit" /> {waitsForTransactionalActionMessage ?? userAndCurrentTableLoadingMessage}
      </Backdrop>
    </PageContainer>
  );
};

export default Home;
