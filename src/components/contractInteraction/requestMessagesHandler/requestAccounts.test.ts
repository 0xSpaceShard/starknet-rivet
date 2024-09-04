import { requestAccountsHandler } from './requestAccounts';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('requestAccountsHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the selected account address if the connection is successful', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce({
        selectedAccount: { address: '0x1234567890abcdef' },
      }) // for 'CONNECT_RIVET_DAPP_RES'
      .mockResolvedValueOnce(null); // for 'REJECT_RIVET_PREAUTHORIZATION'

    const result = await requestAccountsHandler();

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'CONNECT_RIVET_DAPP',
    });

    expect(result).toEqual(['0x1234567890abcdef']);
  });

  it('should throw an error if no wallet account is found', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce(null) // for 'CONNECT_RIVET_DAPP_RES'
      .mockResolvedValueOnce(null); // for 'REJECT_RIVET_PREAUTHORIZATION'

    await expect(requestAccountsHandler()).rejects.toThrow(
      'No wallet account (should not be possible)'
    );
  });

  it('should throw an error if the user aborts', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce(new Promise(() => {})) // for 'CONNECT_RIVET_DAPP_RES'
      .mockResolvedValueOnce('USER_RIVET_ABORTED'); // for 'REJECT_RIVET_PREAUTHORIZATION'

    await expect(requestAccountsHandler()).rejects.toThrow('User aborted');
  });
});
