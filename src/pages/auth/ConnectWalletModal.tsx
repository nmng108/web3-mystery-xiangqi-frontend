import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useCallback } from 'react';
import { useAuthContext, useWalletProviderContext } from '../../hooks';

type WalletIconProps = {
  src: string;
  alt?: string;
}

const WalletIcon: React.FC<WalletIconProps> = (props) => (
  <img
    src={props.src}
    alt={props.alt}
    className="h-6 w-6"
  />
);

type Props = { isOpen: boolean, handleClose: () => void };

const ConnectWalletModal: React.FC<Props> = (props) => {
  const { wallets, connectWallet } = useWalletProviderContext();

  const handleConnectWallet = useCallback(async (rdns: string) => {
    // setSigner(await provider.getSigner());
    await connectWallet(rdns);
    props.handleClose();
  }, [props, connectWallet]);

  return (
    <Dialog open={props.isOpen} onClose={props.handleClose} maxWidth="xs" fullWidth>
      {/* Dialog Header */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5">Connect a Wallet account</Typography>
        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {(Object.keys(wallets).length > 0) ? (
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Choose which Wallet provider you want to connect
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }} className="text-left">
            Available wallets
          </Typography>

          <Stack useFlexGap spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
            {Object.values(wallets).map((wallet: EIP6963ProviderDetail, index) => (
              <Button
                key={index}
                variant="outlined"
                startIcon={<WalletIcon src={wallet.info.icon} alt={wallet.info.name} />}
                fullWidth
                sx={{ justifyContent: 'flex-between', p: 2, textTransform: 'none' }}
                onClick={() => handleConnectWallet(wallet.info.rdns)}
              >
                CONNECT WITH {wallet.info.name.toUpperCase()}
              </Button>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
        </DialogContent>
      ) : (
        <div>You haven't download any wallet extension</div>
      )}

      <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Typography variant="body2" color="textSecondary">
          New to Ethereum wallets?
        </Typography>
        <Button variant="text" color="primary">
          LEARN MORE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConnectWalletModal;
