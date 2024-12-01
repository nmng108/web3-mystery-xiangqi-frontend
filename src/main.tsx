import { StrictMode } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createTheme, CssBaseline, StyledEngineProvider, ThemeProvider } from '@mui/material';
import App from './App.tsx';
import './index.css';
import { AuthContextProvider, GlobalContextProvider, WalletProvider } from './context';
import { type Eip1193Provider } from 'ethers';

const rootElement: HTMLElement = document.getElementById('root')!;
const root: Root = createRoot(rootElement);

const theme = createTheme({
  components: {
    MuiPopover: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiPopper: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiDialog: {
      defaultProps: {
        container: rootElement,
      },
    },
    MuiModal: {
      defaultProps: {
        container: rootElement,
      },
    },
  },
});

root.render(
  <StrictMode>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <WalletProvider>
          <GlobalContextProvider>
            <AuthContextProvider>
              <CssBaseline />
              <App />
            </AuthContextProvider>
          </GlobalContextProvider>
        </WalletProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
