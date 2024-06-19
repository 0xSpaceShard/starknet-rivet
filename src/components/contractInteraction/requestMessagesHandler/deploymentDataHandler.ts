import { GetDeploymentDataResult } from 'starknet-types';

export async function deploymentDataHandler(): Promise<GetDeploymentDataResult> {
  return { address: '0x', class_hash: '0x', salt: '0x', calldata: [], version: 0 };
}
