import { AllowArray, Call, InvokeFunctionResponse } from 'starknet-6';
import { sendMessage, waitForMessage } from '../messageActions';

export async function addInvokeTransactionHandler(params: {
  calls: AllowArray<Call>;
}): Promise<InvokeFunctionResponse> {
  sendMessage({
    type: 'SIMULATE_RIVET_TRANSACTION',
    data: {
      transactions: params.calls,
    },
  });

  const responseSimulate = await Promise.race([
    waitForMessage('SIMULATE_RIVET_TRANSACTION_RES', 10 * 60 * 1000),
  ]);
  sendMessage({
    type: 'EXECUTE_RIVET_TRANSACTION',
    data: {
      transactions: params.calls,
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
