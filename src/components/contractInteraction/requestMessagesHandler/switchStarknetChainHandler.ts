import { SwitchStarknetChainParameters } from 'starknet-types';

export async function switchStarknetChainHandler({
  chainId: _chainId,
}: SwitchStarknetChainParameters): Promise<boolean> {
  console.log('switchStarknetChainHandler');
  return true;
}
