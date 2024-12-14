import { MessageAndTimestamp, P2PExchangeMessageInterface, P2PMessageType } from '../p2pExchangeMessage.ts';
import { getShortErrorMessage } from '../utilities';

class WalletException extends Error {
  private readonly _peerResponse: P2PExchangeMessageInterface;

  constructor(
    err: {
      message: string;
    } & (
      | {
          info: { error: { message: string } };
        }
      | {
          error: { message: string };
        }
    )
  ) {
    const message = getShortErrorMessage(err);
    super(message);
    this._peerResponse = {
      type: P2PMessageType.NONE,
      data: {
        message: message,
        timestamp: Date.now(),
      } as MessageAndTimestamp,
    };
  }

  get peerResponse(): P2PExchangeMessageInterface {
    return this._peerResponse;
  }

  get message(): string {
    return 'Invalid signature';
  }
}

export default WalletException;
