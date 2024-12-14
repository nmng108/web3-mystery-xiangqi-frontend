import { MessageAndTimestamp, P2PExchangeMessageInterface, P2PMessageType } from '../p2pExchangeMessage.ts';

class InvalidSignatureError extends Error {
  private readonly _peerResponse: P2PExchangeMessageInterface;

  constructor() {
    super();
    this._peerResponse = {
      type: P2PMessageType.INVALID_SIGNATURE,
      data: {
        message: 'Invalid signature',
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

export default InvalidSignatureError;
