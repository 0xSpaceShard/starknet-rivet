/* eslint-disable no-await-in-loop */
import { RpcProvider } from 'starknet-6';

import { logError } from '../../background/analytics';
import { BlockWithTxs } from './types';

const starknetApi = {
  getBlockWithTxs: async (
    provider: RpcProvider,
    blockNumber: number,
    setBlockDetails: React.Dispatch<any>
  ): Promise<BlockWithTxs | null> => {
    try {
      const block = (await provider.getBlockWithTxs(blockNumber)) as unknown as BlockWithTxs;
      setBlockDetails(block);

      return block;
    } catch (error) {
      logError('getBlockWithTxs error:', error);
      return null;
    }
  },

  getBlocksWithTxs: async (
    provider: RpcProvider,
    index: number,
    currentBlock: number,
    pageSize: number
  ): Promise<BlockWithTxs[]> => {
    try {
      const start = currentBlock - index * pageSize;
      const end = index + 1 >= 0 ? start - pageSize + 1 : 0;
      const indices: number[] = [];

      for (let i = start; i >= end; i--) {
        if (i < 0) break;
        indices.push(i);
      }
      const blockPromises = indices.map(
        (i) => provider.getBlockWithTxs(i) as Promise<BlockWithTxs>
      );

      const blockData = await Promise.all(blockPromises);

      return blockData;
    } catch (error) {
      logError('getBlocksWithTxs error:', error);
      return [];
    }
  },
};

export default starknetApi;
