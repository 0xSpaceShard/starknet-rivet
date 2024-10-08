import { TypedData } from 'starknet-6';
import { sendMessage, waitForMessage } from '../messageActions';

export async function signTypedDataHandler(params: TypedData) {
  const skipDeploy = 'skipDeploy' in params ? !!params.skipDeploy : false;

  sendMessage({ type: 'SIGN_RIVET_MESSAGE', data: { typedData: params, options: { skipDeploy } } });

  const response = await Promise.race([
    waitForMessage('SIGN_RIVET_MESSAGE_RES', 10 * 60 * 1000),
    waitForMessage('SIGNATURE_RIVET_FAILURE', 10 * 60 * 1000),
  ]);

  if ('error' in response) {
    throw new Error('User abort');
  }

  return response;
}
