import { useInfiniteQuery } from '@tanstack/react-query';
import { RpcProvider } from 'starknet-6';
import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';

const PAGE_SIZE = 15;

const useGetBlocksWithTxs = () => {
  const { selectedUrl: url, currentBlock } = useSharedState();
  const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });

  return useInfiniteQuery({
    queryKey: ['BLOCKS_WITH_TXS', currentBlock, PAGE_SIZE],
    queryFn: ({ pageParam = 0 }) =>
      starknetApi.getBlocksWithTxs(provider, pageParam, currentBlock, PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length > 0 ? allPages.length : undefined;
    },
    initialPageParam: 0,
  });
};

export default useGetBlocksWithTxs;
