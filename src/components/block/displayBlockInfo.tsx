import React from 'react';
import { Stack, Typography } from '@mui/material';
import { darkTheme } from '../..';

interface BlockInfoProps {
  title: string;
  value: string | number;
}

const DisplayBlockInfo: React.FC<BlockInfoProps> = ({ title, value }) => (
  <Stack alignItems={'flex-start'}>
    <Typography color={darkTheme.palette.text.secondary} variant="caption">
      {title}
    </Typography>
    <Stack direction={'row'} alignItems={'center'} spacing={1}>
      <Typography fontSize={'0.9rem'}>{value}</Typography>
    </Stack>
  </Stack>
);

export default DisplayBlockInfo;
