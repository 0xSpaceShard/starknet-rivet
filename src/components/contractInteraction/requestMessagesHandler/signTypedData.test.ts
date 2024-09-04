import { TypedData } from 'starknet-6';
import { signTypedDataHandler } from './signTypedData';
import { sendMessage, waitForMessage } from '../messageActions';

jest.mock('../messageActions', () => ({
  sendMessage: jest.fn(),
  waitForMessage: jest.fn(),
}));

describe('signTypedDataHandler', () => {
  const mockTypedData: TypedData = {
    types: {
      type1: [{ name: 'type1', type: 'type1' }],
      type2: [{ name: 'type2', type: 'type2' }],
    },
    primaryType: 'type1',
    domain: {
      name: 'Starknet',
      version: '1',
    },
    message: {
      data: 'Test',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send the correct message with skipDeploy as false and return the signed response', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce({ signature: '0xsignature' }) // for SIGN_RIVET_MESSAGE_RES
      .mockResolvedValueOnce(null); // for SIGNATURE_RIVET_FAILURE

    const result = await signTypedDataHandler(mockTypedData);

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SIGN_RIVET_MESSAGE',
      data: {
        typedData: mockTypedData,
        options: { skipDeploy: false },
      },
    });

    expect(result).toEqual({ signature: '0xsignature' });
  });

  it('should send the correct message with skipDeploy as true when params include skipDeploy', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce({ signature: '0xsignature' }) // for SIGN_RIVET_MESSAGE_RES
      .mockResolvedValueOnce(null); // for SIGNATURE_RIVET_FAILURE

    const result = await signTypedDataHandler({ ...mockTypedData, skipDeploy: true } as any);

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SIGN_RIVET_MESSAGE',
      data: {
        typedData: { ...mockTypedData, skipDeploy: true } as any,
        options: { skipDeploy: true },
      },
    });

    expect(result).toEqual({ signature: '0xsignature' });
  });

  it('should throw an error if the user aborts during the signature process', async () => {
    (waitForMessage as jest.Mock)
      .mockResolvedValueOnce(new Promise(() => {})) // for SIGN_RIVET_MESSAGE_RES
      .mockResolvedValueOnce({ error: 'Error' }); // for SIGNATURE_RIVET_FAILURE

    await expect(signTypedDataHandler(mockTypedData)).rejects.toThrow('User abort');

    expect(sendMessage).toHaveBeenCalledWith({
      type: 'SIGN_RIVET_MESSAGE',
      data: {
        typedData: mockTypedData,
        options: { skipDeploy: false },
      },
    });
  });
});
