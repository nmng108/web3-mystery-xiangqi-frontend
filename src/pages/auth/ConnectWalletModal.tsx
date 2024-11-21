import {
  Box,
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
import React from 'react';

type Props = { isOpen: boolean, handleClose };

const MetamaskIcon: React.FC = () => (
  <img
    src="https://docs.material-tailwind.com/icons/metamask.svg"
    alt="metamast"
    className="h-6 w-6"
  />
);

const CoinbaseIcon: React.FC = () => (
  <img
    src="https://docs.material-tailwind.com/icons/coinbase.svg"
    alt="metamast"
    className="h-6 w-6 rounded-md"
  />
);

const TrustWalletIcon: React.FC = () => (
  <img
    src="https://docs.material-tailwind.com/icons/trust-wallet.svg"
    alt="metamast"
    className="h-7 w-7 rounded-md border border-blue-gray-50"
  />
);

const ConnectWalletModal: React.FC<Props> = (props) => {

  return (
    <Dialog open={props.isOpen} onClose={props.handleClose} maxWidth="xs" fullWidth>
      {/* Dialog Header */}
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">Connect a Wallet</Typography>
        <IconButton onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Choose which card you want to connect
        </Typography>

        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }} className="text-left">
          POPULAR
        </Typography>

        <Stack useFlexGap spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<MetamaskIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-between', p: 2, textTransform: 'none' }}
          >
            CONNECT WITH METAMASK
          </Button>
          <Button
            variant="outlined"
            startIcon={<CoinbaseIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-between', p: 2, textTransform: 'none' }}
          >
            CONNECT WITH COINBASE
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }} className="text-left">
          OTHER
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<TrustWalletIcon />}
            fullWidth
            sx={{ justifyContent: 'flex-between', p: 2, textTransform: 'none' }}
          >
            Connect with Trust Wallet
          </Button>
        </Box>
      </DialogContent>

      {/* Dialog Footer */}
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
