import { Box, Link, Tooltip } from '@mui/material';
import React from 'react';
import { useCopyTooltip } from '../hooks/hooks';
import { shortenAddress } from '../utils/utils';

interface AddressTooltipProps {
  address: string;
}

const AddressTooltip: React.FC<AddressTooltipProps> = ({ address }) => {
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    showTooltip();
  };

  return (
    <Box paddingY={1}>
      <Tooltip
        PopperProps={{ disablePortal: true }}
        open={isCopyTooltipShown}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title="Address copied to clipboard"
      >
        <Link
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopyAddress();
          }}
        >
          {shortenAddress(address)}
        </Link>
      </Tooltip>
    </Box>
  );
};

export default AddressTooltip;
