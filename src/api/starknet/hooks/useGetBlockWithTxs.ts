import { useMutation } from '@tanstack/react-query';
import { RpcProvider } from 'starknet-6';

import { useSharedState } from '../../../components/context/context';
import starknetApi from '../service';

const useGetBlockWithTxs = () => {
  const { selectedUrl: url } = useSharedState();
  const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });

  return useMutation({
    mutationFn: (blockNumber: number) => starknetApi.getBlockWithTxs(provider, blockNumber),
  });
};

export default useGetBlockWithTxs;
