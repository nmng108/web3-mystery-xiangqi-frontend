import { MessageAndTimestamp, P2PExchangeMessageInterface, P2PMessageType } from '../p2pExchangeMessage.ts';

class InvalidMoveError extends Error {
  private readonly _peerResponse: P2PExchangeMessageInterface;

  constructor(message?: string) {
    super(message);

    this._peerResponse = {
      type: P2PMessageType.INVALID_MOVE,
      data: {
        message: this.message ?? 'Invalid move',
        timestamp: Date.now(),
      } as MessageAndTimestamp,
    };
  }

  get peerResponse(): P2PExchangeMessageInterface {
    return this._peerResponse;
  }
}

export default InvalidMoveError;
