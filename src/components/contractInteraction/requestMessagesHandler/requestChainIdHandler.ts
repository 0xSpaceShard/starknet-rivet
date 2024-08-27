import { sendMessage, waitForMessage } from '../messageActions';

export async function requestChainIdHandler() {
  sendMessage({
    type: 'REQUEST_CHAIN_ID_HANDLER',
  });

  const response = await Promise.race([
    waitForMessage('REQUEST_CHAIN_ID_HANDLER_RES', 10 * 60 * 1000),
  ]);

  if (response.error) {
    throw new Error('No connection');
  }

  return response.chainId;
}
