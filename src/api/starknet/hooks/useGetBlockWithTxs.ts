import { useMutation } from '@tanstack/react-query';
import { RpcProvider } from 'starknet';

import starknetApi from '../service';
import { useRpcProviderState } from '../../../context/rpcProvider/RpcProviderContext';
import { useSharedState } from '../../../components/context/context';

const useGetBlockWithTxs = () => {
  const { rpcProvider } = useRpcProviderState();
  const { setBlockDetails } = useSharedState();

  return useMutation({
    mutationFn: (blockNumber: number) =>
      starknetApi.getBlockWithTxs(rpcProvider as RpcProvider, blockNumber, setBlockDetails),
  });
};

export default useGetBlockWithTxs;
