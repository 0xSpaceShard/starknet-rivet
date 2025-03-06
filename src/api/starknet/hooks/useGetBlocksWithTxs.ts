import { useInfiniteQuery } from '@tanstack/react-query';
import { RpcProvider } from 'starknet-6';

import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';
import { useRpcProviderState } from '../../../context/rpcProvider/RpcProviderContext';

const PAGE_SIZE = 15;

const useGetBlocksWithTxs = (pageSize?: number) => {
  const { currentBlock } = useSharedState();
  const { rpcProvider } = useRpcProviderState();

  return useInfiniteQuery({
    queryKey: [
      'BLOCKS_WITH_TXS',
      currentBlock,
      pageSize || PAGE_SIZE,
      rpcProvider?.channel.nodeUrl,
    ],
    queryFn: ({ pageParam = 0 }) =>
      starknetApi.getBlocksWithTxs(
        rpcProvider as RpcProvider,
        pageParam,
        currentBlock,
        pageSize || PAGE_SIZE
      ),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export default useGetBlocksWithTxs;
