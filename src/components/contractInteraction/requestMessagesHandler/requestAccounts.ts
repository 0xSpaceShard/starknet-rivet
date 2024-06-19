import { RequestAccountsParameters } from 'starknet-types';
import { sendMessage, waitForMessage } from '../messageActions';

export async function requestAccountsHandler(_params?: RequestAccountsParameters) {
  sendMessage({
    type: 'CONNECT_RIVET_DAPP',
  });

  const result = await Promise.race([
    waitForMessage('CONNECT_RIVET_DAPP_RES', 10 * 60 * 1000),
    waitForMessage('REJECT_RIVET_PREAUTHORIZATION', 10 * 60 * 1000).then(
      () => 'USER_RIVET_ABORTED' as const
    ),
  ]);
  if (!result) {
    throw Error('No wallet account (should not be possible)');
  }
  if (result === 'USER_ABORTED') {
    throw Error('User aborted');
  }

  const { data } = result;

  return [data.address];
}
