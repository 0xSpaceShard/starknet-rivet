import { WatchAssetParameters } from 'starknet-types';
import { sendMessage, waitForMessage } from '../messageActions';

export async function watchAssetHandler(_callParams: WatchAssetParameters): Promise<boolean> {
  sendMessage({
    type: 'WATCH_ASSET_HANDLER',
    data: _callParams,
  });

  const response = await Promise.race([waitForMessage('WATCH_ASSET_HANDLER_RES', 10 * 60 * 1000)]);
  if (!response) {
    throw new Error('Bad Asset');
  }

  return response;
}
