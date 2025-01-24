import React from 'react';
import { validateAndParseAddress } from 'starknet-6';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import { useSharedState } from '../context/context';
import { useAccountContracts } from '../hooks/useAccountContracts';
import { getTokenBalance } from '../../background/contracts';
import { ETH_ADDRESS } from '../../background/constants';
import { getBalanceStr } from '../utils/utils';

interface ITokenDropdownProps {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}

export interface Token {
  address: string;
  balance: string;
  symbol: string;
}

export const TokenDropdown: React.FC<ITokenDropdownProps> = ({ value, onChange }) => {
  const { data: accountContracts } = useAccountContracts();
  const { selectedAccount, currentBalance } = useSharedState();

  const [tokenBalances, setTokenBalances] = React.useState<Array<Token>>([
    {
      address: ETH_ADDRESS,
      symbol: 'ETH',
      balance: getBalanceStr(currentBalance),
    },
  ]);

  const contracts = React.useMemo(
    () => accountContracts.get(selectedAccount?.address ?? '') ?? [],
    [accountContracts, selectedAccount]
  );

  React.useEffect(() => {
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

  return (
    <FormControl fullWidth>
      <InputLabel id="token-dropdown">Token</InputLabel>
      <Select labelId="token-dropdown" value={value} label="Token" onChange={onChange}>
        {tokenBalances.map((token) => (
          <MenuItem key={token.address} value={token.address}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1">{token.symbol}</Typography>-
              <Typography variant="subtitle2">{token.balance}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
