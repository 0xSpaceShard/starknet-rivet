/* eslint-disable no-await-in-loop */
import { RpcProvider } from 'starknet-6';

import { logError } from '../../background/analytics';
import { BlockWithTxs, BlocksWithTxs } from './types';

const starknetApi = {
  getBlockTransactionCount: async (
    provider: RpcProvider,
    index: number
  ): Promise<number | null> => {
    try {
      return await provider.getBlockTransactionCount(index);
    } catch (error) {
      logError('getTransactionBlock error:', error);
      return null;
    }
  },

  getBlockWithTxs: async (
    provider: RpcProvider,
    blockNumber: number
  ): Promise<BlockWithTxs | null> => {
    try {
      return (await provider.getBlockWithTxs(blockNumber)) as unknown as BlockWithTxs;
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
  ): Promise<BlocksWithTxs[]> => {
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
      const transactionCountPromises = indices.map((i) =>
        starknetApi.getBlockTransactionCount(provider, i)
      );

      const [blocks, transactionCounts] = await Promise.all([
        Promise.all(blockPromises),
        Promise.all(transactionCountPromises),
      ]);

      const blockData: BlocksWithTxs[] = blocks
        .map((block, idx) => {
          const transactionCount = transactionCounts[idx];
          return {
            ...block,
            transactionCount: transactionCount as number,
          };
        })
        .filter((block): block is BlocksWithTxs => block !== null);

      return blockData;
    } catch (error) {
      logError('getBlocksWithTxs error:', error);
      return [];
    }
  },
};

export default starknetApi;
