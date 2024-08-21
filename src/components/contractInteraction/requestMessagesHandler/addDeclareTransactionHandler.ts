import { AddDeclareTransactionParameters, AddDeclareTransactionResult } from 'starknet-types';
import { sendMessage, waitForMessage } from '../messageActions';
import { json } from 'starknet-6';

export async function addDeclareTransactionHandler(
  params: AddDeclareTransactionParameters
): Promise<AddDeclareTransactionResult> {
  const { contract_class, compiled_class_hash } = params;

  if (!contract_class.abi) {
    throw new Error('Missing ABI');
  }

  sendMessage({
    type: 'REQUEST_DECLARE_CONTRACT',
    data: {
      payload: {
        contract: json.stringify(contract_class), // FIXME: It won't work
        compiledClassHash: compiled_class_hash,
      },
    },
  });
  const result = await waitForMessage('REQUEST_DECLARE_CONTRACT_RES', 1000);
  if (result.error === 'abort') {
    throw Error('User abort');
  }
  if (result.error === 'timeout') {
    throw Error('User action timed out');
  }

  return {
    transaction_hash: result.transaction_hash as string,
    class_hash: result.class_hash as string,
  };
}
