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
  const { selectedUrl: url, setBlockDetails, devnetIsAlive } = useSharedState();

  const fetchTransactionsDetailsByBlock = useCallback(
    async (index: number) => {
      if (!devnetIsAlive) return;

      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const block = await provider.getBlockWithTxs(index);
      setBlockDetails(block);
    },
    [url, setBlockDetails]
  );

  const fetchTransactionDetailsForLatestBlocks = useCallback(
    async (latestIdx: number, count: number = 10) => {
      const items: any = [];
      if (!devnetIsAlive) return items;

      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const endIdx = latestIdx - count + 1 > 0 ? latestIdx - count + 1 : 0;

      for (let i = latestIdx; i >= endIdx; i--) {
        // eslint-disable-next-line no-await-in-loop
        const block = await provider.getBlockWithTxs(i);
        items.push(block);
      }
      return items;
    },
    [url]
  );

  return { fetchTransactionsDetailsByBlock, fetchTransactionDetailsForLatestBlocks };
};
