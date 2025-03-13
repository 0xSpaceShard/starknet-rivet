import { Link } from 'react-router-dom';
import { Box, Button, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import OnboardingContainer from './container';

import { handleCopyToClipboard } from '../../../components/utils/utils';
import { useCopyTooltip } from '../../../components/hooks/hooks';

const OnboardingStart = () => {
  const { isCopyTooltipShown, showTooltip } = useCopyTooltip();

  return (
    <OnboardingContainer
      title="Install"
      footer={
        <Link to="/onboarding/configure">
          <Button fullWidth variant="outlined">
            Continue
          </Button>
        </Link>
      }
    >
      <Box
        component="div"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        gap={2}
        width="100%"
      >
        <Typography>
          Rivet requires Foundry Anvil to run a local chain. Run the following command in your CLI
          to install Foundry:
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
          <Typography variant="subtitle1">curl -L https://foundry.paradigm.xyz | bash</Typography>
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
        <Typography>When installed, you can continue.</Typography>
      </Box>
    </OnboardingContainer>
  );
};

export default OnboardingStart;
