import { useCallback, useState } from 'react';
import { RpcProvider } from 'starknet-6';
import { useSharedState } from '../context/context';

export const useCopyTooltip = (initialState: boolean = false, timeout: number = 3000) => {
  const [isCopyTooltipShown, setIsCopyTooltipShown] = useState(initialState);

  const showTooltip = () => {
    setIsCopyTooltipShown(true);
    setTimeout(() => setIsCopyTooltipShown(false), timeout);
  };

  return {
    isCopyTooltipShown,
    showTooltip,
  };
};

export const useFetchTransactionsDetails = () => {
  const { selectedUrl: url, setBlockDetails } = useSharedState();

  const fetchTransactionsDetailsByBlock = useCallback(
    async (index: number) => {
      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const tx = await provider.getBlockWithTxs(index);
      setBlockDetails(tx);
    },
    [url, setBlockDetails]
  );

  return { fetchTransactionsDetailsByBlock };
};
