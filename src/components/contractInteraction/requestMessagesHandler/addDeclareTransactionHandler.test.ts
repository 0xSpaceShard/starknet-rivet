import { addDeclareTransactionHandler } from './addDeclareTransactionHandler';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('addDeclareTransactionHandler', () => {
  const mockParams = {
    contract_class: {
      abi: 'function1',
    },
    compiled_class_hash: '0x1234567890abcdef',
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should succeed and return the transaction hash and class hash', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce({
      transaction_hash: '0xtransactionhash',
      class_hash: '0xclasshash',
    }); // for REQUEST_DECLARE_CONTRACT_RES

    const result = await addDeclareTransactionHandler(mockParams);

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'REQUEST_DECLARE_CONTRACT',
      data: {
        payload: {
          contract: JSON.stringify(mockParams.contract_class),
          compiledClassHash: mockParams.compiled_class_hash,
        },
      },
    });

    expect(result).toEqual({
      transaction_hash: '0xtransactionhash',
      class_hash: '0xclasshash',
    });
  });

  it('should throw an error if ABI is missing', async () => {
    const invalidParams = { ...mockParams, contract_class: {} } as any;

    await expect(addDeclareTransactionHandler(invalidParams)).rejects.toThrow('Missing ABI');
  });

  it('should throw an error if the user aborts the transaction', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce({
      error: 'abort',
    }); // for REQUEST_DECLARE_CONTRACT_RES

    await expect(addDeclareTransactionHandler(mockParams)).rejects.toThrow('User abort');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'REQUEST_DECLARE_CONTRACT',
      data: {
        payload: {
          contract: JSON.stringify(mockParams.contract_class),
          compiledClassHash: mockParams.compiled_class_hash,
        },
      },
    });
  });

  it('should throw an error if the user action times out', async () => {
    (waitForMessage as jest.Mock).mockResolvedValueOnce({
      error: 'timeout',
    }); // for REQUEST_DECLARE_CONTRACT_RES

    await expect(addDeclareTransactionHandler(mockParams)).rejects.toThrow('User action timed out');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'REQUEST_DECLARE_CONTRACT',
      data: {
        payload: {
          contract: JSON.stringify(mockParams.contract_class),
          compiledClassHash: mockParams.compiled_class_hash,
        },
      },
    });
  });
});
