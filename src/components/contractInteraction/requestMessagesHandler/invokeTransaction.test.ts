import { addInvokeTransactionHandler } from './invokeTransaction';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('addInvokeTransactionHandler', () => {
  const mockCalls = [{ to: '0x123', data: [] }] as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should simulate and execute a transaction and return the transaction hash', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce({ gas_fee: '1000' }) // for SIMULATE_RIVET_TRANSACTION_RES
      .mockResolvedValueOnce({ transaction_hash: '0xhash' }) // for EXECUTE_RIVET_TRANSACTION_RES
      .mockResolvedValueOnce(null); // for RIVET_TRANSACTION_FAILED

    const result = await addInvokeTransactionHandler({ calls: mockCalls });

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SIMULATE_RIVET_TRANSACTION',
      data: {
        transactions: mockCalls,
      },
    });

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'EXECUTE_RIVET_TRANSACTION',
      data: {
        transactions: mockCalls,
      },
      gas_fee: '1000',
      error: undefined,
    });

    expect(result.transaction_hash).toBe('0xhash');
  });

  it('should throw an error if the user aborts during execution', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce({ gas_fee: '1000' }) // for SIMULATE_RIVET_TRANSACTION_RES
      .mockResolvedValueOnce(new Promise(() => {})) // for EXECUTE_RIVET_TRANSACTION_RES
      .mockResolvedValueOnce({ error: 'User abort' }); // for RIVET_TRANSACTION_FAILED

    await expect(addInvokeTransactionHandler({ calls: mockCalls })).rejects.toThrow('User abort');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SIMULATE_RIVET_TRANSACTION',
      data: {
        transactions: mockCalls,
      },
    });

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'EXECUTE_RIVET_TRANSACTION',
      data: {
        transactions: mockCalls,
      },
      gas_fee: '1000',
      error: undefined,
    });
  });
});
