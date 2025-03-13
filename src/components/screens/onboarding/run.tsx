import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Grid, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import OnboardingContainer from './container';
import { useCopyTooltip } from '../../../components/hooks/hooks';
import { handleCopyToClipboard } from '../../../components/utils/utils';

const OnboardingRun = () => {
  const [params] = useSearchParams();
  // const navigate = useNavigate();

  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  const command = React.useMemo(() => {
    let tempCommand = 'anvil \\\n';
    if (params.get('chainId')) tempCommand += `--chain-id ${params.get('chainId')} \\\n`;
    if (params.get('forkBlockNumber'))
      tempCommand += `--fork-block-number ${params.get('forkBlockNumber')} \\\n`;
    if (params.get('forkUrl')) tempCommand += `--fork-url ${params.get('forkUrl')} \\\n`;
    if (params.get('port') !== '8545') tempCommand += `--port ${params.get('port')} \\\n`;
    if (!params.get('autoMine')) tempCommand += '--no-mining \\\n';
    if (params.get('blockBaseFeePerGas'))
      tempCommand += `--block-base-fee-per-gas ${params.get('blockBaseFeePerGas')} \\\n`;
    if (params.get('blockTime')) tempCommand += `--block-time ${params.get('blockTime')} \\\n`;
    if (params.get('gasLimit')) tempCommand += `--gas-limit ${params.get('gasLimit')} \\\n`;
    if (params.get('gasPrice')) tempCommand += `--gas-price ${params.get('gasPrice')} \\\n`;
    return tempCommand.replace(/ \\\n$/, '');
  }, [params]);

  return (
    <OnboardingContainer title="Run Anvil" footer={<></>}>
      <Stack>
        <Typography>
          Run the following command in your CLI to start a local chain with your configuration:
        </Typography>

        <Box
          component="div"
          padding={2}
          bgcolor="#3b3b3b"
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius={2}
        >
          <Typography>{command}</Typography>
          <Grid item flexBasis={'50px'} flexGrow={0} padding={'0 10px'}>
            <Tooltip
              PopperProps={{
                disablePortal: true,
              }}
              open={isCopyTooltipShown}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title="Copied"
            >
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyToClipboard('curl -L https://foundry.paradigm.xyz | bash');
                  showTooltip();
                }}
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
        </Box>
      </Stack>
    </OnboardingContainer>
  );
};

export default OnboardingRun;
