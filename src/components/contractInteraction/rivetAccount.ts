import {
  Abi,
  Account,
  AllowArray,
  Call,
  InvokeFunctionResponse,
  ProviderInterface,
  Signature,
  TypedData,
  UniversalDetails,
  defaultProvider,
} from 'starknet-6';

import { sendMessage, SignMessageOptions, waitForMessage } from './messageActions';

export class RivetAccount extends Account {
  constructor(address: string, pk: string, provider?: ProviderInterface) {
    super(provider || defaultProvider, address, pk);
  }

  public async execute(
    transactions: AllowArray<Call>,
    abis?: Abi[] | UniversalDetails,
    transactionsDetail?: UniversalDetails
  ): Promise<InvokeFunctionResponse> {
    sendMessage({
      type: 'SIMULATE_RIVET_TRANSACTION',
      data: {
        transactions,
        abis,
        transactionsDetail,
      },
    });

    const responseSimulate = await Promise.race([
      waitForMessage('SIMULATE_RIVET_TRANSACTION_RES', 10 * 60 * 1000),
    ]);

    sendMessage({
      type: 'EXECUTE_RIVET_TRANSACTION',
      data: {
        transactions,
        abis,
        transactionsDetail,
      },
      gas_fee: responseSimulate?.gas_fee,
      error: responseSimulate?.error,
    });

    const response = await Promise.race([
      waitForMessage('EXECUTE_RIVET_TRANSACTION_RES', 10 * 60 * 1000),
      waitForMessage('RIVET_TRANSACTION_FAILED', 10 * 60 * 1000),
    ]);

    if (response.error) {
      throw Error('User abort');
    }

    return {
      transaction_hash: response.transaction_hash,
    };
  }

  public async signMessage(
    typedData: TypedData,
    options: SignMessageOptions = { skipDeploy: false }
  ): Promise<Signature> {
    sendMessage({ type: 'SIGN_RIVET_MESSAGE', data: { typedData, options } });

    const response = await Promise.race([
      waitForMessage('SIGN_RIVET_MESSAGE_RES', 10 * 60 * 1000),
      waitForMessage('SIGNATURE_RIVET_FAILURE', 10 * 60 * 1000),
    ]);

    if (response.error) {
      throw Error('User abort');
    }

    return response.signature;
  }
}
