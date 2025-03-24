import { useState, useEffect, useMemo } from 'react';

import { validateAndParseAddress } from 'starknet-6';

import { ETH_ADDRESS, ETH_SYMBOL } from '../../background/constants';
import { getBalanceStr } from '../utils/utils';
import { useAccountContracts } from './useAccountContracts';
import { useSharedState } from '../context/context';
import { getTokenBalance } from '../../background/contracts';

export interface Token {
  address: string;
  balance: string;
  symbol: string;
}

export const useTokens = () => {
  const { data: accountContracts } = useAccountContracts();
  const { selectedAccount, currentBalance } = useSharedState();

  const [tokenBalances, setTokenBalances] = useState<Array<Token>>([
    {
      address: ETH_ADDRESS,
      symbol: ETH_SYMBOL,
      balance: getBalanceStr(currentBalance || BigInt(0)),
    },
  ]);

  const contracts = useMemo(
    () => accountContracts.get(selectedAccount?.address ?? '') ?? [],
    [accountContracts, selectedAccount]
  );

  useEffect(() => {
    if (!contracts?.length) return;

    const balancePromises = contracts.map(async (address) => {
      const cleanAddress = validateAndParseAddress(address);
      const resp = await getTokenBalance(cleanAddress);
      if (!resp) return [];

      const balance = resp.balance / BigInt(10n ** 18n);
      const balanceStr = balance.toString();
      return {
        address,
        symbol: resp.symbol,
        balance: balanceStr,
      };
    });
    Promise.all(balancePromises).then((results) => {
      const validTokens = results.filter((token): token is Token => token !== null);
      setTokenBalances((prev) => [...prev, ...validTokens]);
    });
  }, [contracts]);

  const getTokenSymbol = (address: string) =>
    tokenBalances?.find((token) => token.address === address)?.symbol;

  const hasNonEthTokens: boolean = useMemo(
    () => tokenBalances?.some((t) => t.symbol !== ETH_SYMBOL) ?? false,
    [tokenBalances]
  );

  return { tokenBalances, getTokenSymbol, hasNonEthTokens };
};
