import { Box, Button, Typography, Grid, Tooltip } from '@mui/material';
import { useCopyTooltip } from '../hooks/hooks';
import { darkTheme } from '../..';
import { handleCopyToClipboard, getBalanceStr, shortenAddress } from '../utils/utils';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const AccountItem = (account: any, handleAccountClick: any) => {
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  return (
    <Box>
      <Button
        variant="text"
        sx={{
          width: '90%',
          textTransform: 'none',
          paddingY: 1,
          paddingX: 2,
          color: darkTheme.palette.text.secondary,
        }}
        onClick={() => handleAccountClick(account)}
      >
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Typography variant="caption">{shortenAddress(account.address)}</Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption">
              {getBalanceStr((account as any)?.balance?.eth?.amount)} ETH
            </Typography>
          </Grid>
        </Grid>
      </Button>
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
        <Button
          variant={'text'}
          sx={{
            maxWidth: '30px',
            maxHeight: '30px',
            minWidth: '30px',
            minHeight: '30px',
          }}
          startIcon={<ContentCopyIcon />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopyToClipboard(account.address);
            showTooltip();
          }}
        ></Button>
      </Tooltip>
    </Box>
  );
};
