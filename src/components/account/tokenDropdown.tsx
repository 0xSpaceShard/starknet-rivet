import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';

import { useTokens } from '../hooks/useTokens';

interface ITokenDropdownProps {
  value: string;
  onChange: (e: SelectChangeEvent) => void;
}

export const TokenDropdown: React.FC<ITokenDropdownProps> = ({ value, onChange }) => {
  const { tokenBalances } = useTokens();

  return (
    <FormControl fullWidth>
      <InputLabel id="token-dropdown">Token</InputLabel>
      <Select labelId="token-dropdown" value={value} label="Token" onChange={onChange}>
        {tokenBalances.map((token) => (
          <MenuItem key={token.address} value={token.address} disabled={token.balance === '0'}>
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
