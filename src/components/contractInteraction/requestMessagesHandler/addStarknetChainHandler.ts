import { AddStarknetChainParameters } from 'starknet-types';

export async function addStarknetChainHandler(
  _callParams: AddStarknetChainParameters
): Promise<boolean> {
  console.log('addStarknetChainHandler');
  return true;
}
