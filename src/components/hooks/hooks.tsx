import { useCallback, useState } from 'react';
import { useSharedState } from '../context/context';
import useGetBlockWithTxs from '../../api/starknet/hooks/useGetBlockWithTxs';
import { useProviderState } from '../../context/provider/ProviderContext';

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
  const { mutateAsync: getBlockWithTxs } = useGetBlockWithTxs();
  const { provider } = useProviderState();

  const fetchTransactionsDetailsByBlock = useCallback(
    async (index: number) => {
      if (!devnetIsAlive) return;

      const block = await getBlockWithTxs(index);
      setBlockDetails(block);
    },
    [url, setBlockDetails]
  );

  const fetchTransactionDetailsForLatestBlocks = useCallback(
    async (endIndex: number, count: number = 10) => {
      if (!devnetIsAlive || !provider) return [];

      const endIdx = endIndex - count + 1 > 0 ? endIndex - count + 1 : 0;
      const items: Awaited<ReturnType<typeof provider.getBlockWithTxs>>[] = [];

      for (let i = endIndex; i >= endIdx; i--) {
        // eslint-disable-next-line no-await-in-loop
        const block = await getBlockWithTxs(i);
        if (block) items.push(block as any);
      }
      return items;
    },
    [url]
  );

  return { fetchTransactionsDetailsByBlock, fetchTransactionDetailsForLatestBlocks };
};
