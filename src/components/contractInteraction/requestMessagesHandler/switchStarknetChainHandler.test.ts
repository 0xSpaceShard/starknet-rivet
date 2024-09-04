import { switchStarknetChainHandler } from './switchStarknetChainHandler';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('switchStarknetChainHandler', () => {
  const mockChainId = '0x1234';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed and return true when chain switching is successful', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce(true); // for SWITCH_STARKNET_CHAIN_RES

    const result = await switchStarknetChainHandler({ chainId: mockChainId });

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SWITCH_STARKNET_CHAIN',
      data: mockChainId,
    });

    expect(result).toBe(true);
  });

  it('should throw an error when no response is received', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce(null); // for SWITCH_STARKNET_CHAIN_RES

    await expect(switchStarknetChainHandler({ chainId: mockChainId })).rejects.toThrow(
      'Error chainID'
    );

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SWITCH_STARKNET_CHAIN',
      data: mockChainId,
    });
  });
});
