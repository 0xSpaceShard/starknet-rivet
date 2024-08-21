import { SwitchStarknetChainParameters } from 'starknet-types';
import { sendMessage, waitForMessage } from '../messageActions';

export async function switchStarknetChainHandler({
  chainId: _chainId,
}: SwitchStarknetChainParameters): Promise<boolean> {
  sendMessage({
    type: 'SWITCH_STARKNET_CHAIN',
    data: _chainId,
  });

  const response = await Promise.race([
    waitForMessage('SWITCH_STARKNET_CHAIN_RES', 10 * 60 * 1000),
  ]);
  if (!response) {
    throw new Error('Error chainID');
  }

  return response;
}
