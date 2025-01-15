import React from 'react';
import { Box, IconButton, Button, Typography, Grid, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useCopyTooltip } from '../hooks/hooks';
import { darkTheme } from '../..';
import { handleCopyToClipboard, getBalanceStr, shortenAddress } from '../utils/utils';
import { AccountData } from '../context/interfaces';
import { useSharedState } from '../context/context';

export const AccountItem: React.FC<{
  account: AccountData;
  handleAccountClick: (account: any) => void;
}> = ({ account, handleAccountClick }) => {
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();
  const { selectedAccount } = useSharedState();

  const isSelected = selectedAccount?.address === account?.address;

  return (
    <Box>
      <Grid container direction={'row'} alignItems={'center'}>
        <Grid item flexGrow={1}>
          <Button
            variant="text"
            sx={{
              width: '100%',
              textTransform: 'none',
              padding: 1,
              color: darkTheme.palette.text.secondary,
              border: isSelected ? '1px solid' : 'none',
              borderColor: isSelected ? darkTheme.palette.primary.main : 'transparent',
              borderRadius: isSelected ? '4px' : '0px',
            }}
            onClick={() => handleAccountClick(account)}
          >
            <Grid container justifyContent={'space-between'}>
              <Grid item xs={9}>
                <Typography>{shortenAddress(account.address, 10)}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography variant="caption">
                  {getBalanceStr((account as any)?.balance?.eth?.amount)} ETH
                </Typography>
              </Grid>
            </Grid>
          </Button>
        </Grid>
        <Grid item flexBasis={'50px'} flexGrow={0} padding={'0 10px'}>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            open={isCopyTooltipShown}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Address copied to clipboard"
          >
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopyToClipboard(account.address);
                showTooltip();
              }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
};
