import { requestChainIdHandler } from './requestChainIdHandler';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('requestChainIdHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the chainId when the request is successful', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce({
      chainId: '0x1',
    }); // for REQUEST_CHAIN_ID_HANDLER_RES

    const result = await requestChainIdHandler();

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'REQUEST_CHAIN_ID_HANDLER',
    });

    expect(result).toBe('0x1');
  });

  it('should throw an error when the response contains an error', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce({
      error: 'Error',
    }); // for REQUEST_CHAIN_ID_HANDLER_RES

    await expect(requestChainIdHandler()).rejects.toThrow('No connection');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'REQUEST_CHAIN_ID_HANDLER',
    });
  });
});
