import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { darkTheme } from '../..';
import { handleCopyAddress, shortenAddress } from '../utils/utils';

interface BlockInfoProps {
  title: string;
  value: string | number;
}

const DisplayBlockInfo: React.FC<BlockInfoProps> = ({ title, value }) => {
  const isCopyable = ['hash', 'sender', 'block hash'].includes(title.toLowerCase());

  return (
    <Stack alignItems={'flex-start'}>
      <Typography color={darkTheme.palette.text.secondary} variant="caption">
        {title}
      </Typography>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        {isCopyable ? (
          <Button
            fullWidth
            variant="text"
            sx={{
              textTransform: 'none',
              paddingY: 0,
              paddingX: 0,
              color: 'white',
            }}
            onClick={() => handleCopyAddress(shortenAddress(value as string, 5))}
          >
            <Typography fontSize={'0.9rem'}>{shortenAddress(value as string, 5)}</Typography>
          </Button>
        ) : (
          <Typography fontSize={'0.9rem'}>{value}</Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default DisplayBlockInfo;
