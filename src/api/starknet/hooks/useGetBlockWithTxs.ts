import { useMutation } from '@tanstack/react-query';
import { RpcProvider } from 'starknet-6';

import starknetApi from '../service';
import { useProviderState } from '../../../context/provider/ProviderContext';

const useGetBlockWithTxs = () => {
  const { provider } = useProviderState();

  return useMutation({
    mutationFn: (blockNumber: number) =>
      starknetApi.getBlockWithTxs(provider as RpcProvider, blockNumber),
  });
};

export default useGetBlockWithTxs;
