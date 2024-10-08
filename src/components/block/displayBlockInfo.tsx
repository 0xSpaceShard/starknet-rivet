import React from 'react';
import { Link, Stack, Tooltip, Typography } from '@mui/material';
import { darkTheme } from '../..';
import { handleCopyToClipboard, shortenAddress } from '../utils/utils';
import { useCopyTooltip } from '../hooks/hooks';

interface BlockInfoProps {
  title: string;
  value: string | number;
}

const DisplayBlockInfo: React.FC<BlockInfoProps> = ({ title, value }) => {
  const isCopyable = ['hash', 'sender', 'block hash'].includes(title.toLowerCase());
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  return (
    <Stack alignItems={'flex-start'}>
      <Typography color={darkTheme.palette.text.secondary} variant="caption">
        {title}
      </Typography>
      <Stack direction={'row'} alignItems={'center'} spacing={1}>
        {isCopyable ? (
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            open={isCopyTooltipShown}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={`${title} copied to clipboard`}
          >
            <Link
              sx={{
                textTransform: 'none',
                paddingY: 0,
                paddingX: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyToClipboard(value as string);
                showTooltip();
              }}
            >
              <Typography fontSize={'0.9rem'}>{shortenAddress(value as string, 5)}</Typography>
            </Link>
          </Tooltip>
        ) : (
          <Typography fontSize={'0.9rem'}>{value}</Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default DisplayBlockInfo;
