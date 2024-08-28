import { GetDeploymentDataResult } from 'starknet-types';
import { sendMessage, waitForMessage } from '../messageActions';

// TODO -> For this function we need to store data from account that are declared but not deployed.
export async function deploymentDataHandler(): Promise<GetDeploymentDataResult> {
  sendMessage({
    type: 'DEPLOYMENT_DATA_HANDLER',
  });

  const result = await Promise.race([
    waitForMessage('DEPLOYMENT_DATA_HANDLER_RES', 10 * 60 * 1000),
    waitForMessage('REJECT_RIVET_PREAUTHORIZATION', 10 * 60 * 1000).then(
      () => 'USER_RIVET_ABORTED' as const
    ),
  ]);
  if (!result) {
    throw Error('No wallet account');
  }
  if (result === 'USER_RIVET_ABORTED') {
    throw Error('User aborted');
  }

  return { address: '0x', class_hash: '0x', salt: '0x', calldata: [], version: 0 };
}
