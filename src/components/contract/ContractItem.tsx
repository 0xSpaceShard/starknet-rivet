import { Box, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import { handleCopyToClipboard, shortenAddress } from '../utils/utils';
import { useCopyTooltip } from '../hooks/hooks';

interface StackItemProps {
  address: string;
  name: string;
}

export const ContractItem: React.FC<StackItemProps> = ({ address, name }) => {
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  return (
    <Box>
      <Grid container direction="row" alignItems="center">
        <Grid item flexGrow={1} padding={1}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="subtitle1">{name}:</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2">{shortenAddress(address, 10)}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item flexBasis="50px" flexGrow={0} padding="0 10px">
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
                handleCopyToClipboard(address);
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
