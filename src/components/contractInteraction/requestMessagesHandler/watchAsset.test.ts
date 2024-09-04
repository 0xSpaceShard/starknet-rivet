import { WatchAssetParameters } from 'starknet-types';
import { watchAssetHandler } from './watchAsset';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('watchAssetHandler', () => {
  const mockCallParams: WatchAssetParameters = {
    type: 'ERC20',
    options: {
      address: '0x1234567890abcdef',
      symbol: 'TEST',
      decimals: 18,
      image: 'https://example.com/token.png',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed and return true when the asset is successfully watched', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce(true); // for WATCH_ASSET_HANDLER_RES

    const result = await watchAssetHandler(mockCallParams);

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'WATCH_ASSET_HANDLER',
      data: mockCallParams,
    });

    expect(result).toBe(true);
  });

  it('should throw an error when no response is received', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce(null); // for WATCH_ASSET_HANDLER_RES

    await expect(watchAssetHandler(mockCallParams)).rejects.toThrow('Bad Asset');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'WATCH_ASSET_HANDLER',
      data: mockCallParams,
    });
  });
});
