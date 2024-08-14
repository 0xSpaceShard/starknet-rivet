import { Link as RouteLink } from 'react-router-dom';
import { Box, Typography, Stack, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { useSharedState } from '../context/context';
import CheckDevnetStatus from '../checkDevnetStatus/checkDevnetStatus';
import { darkTheme } from '../..';

export const StatusHeader = () => {
  const context = useSharedState();
  const { selectedUrl: url, configData, currentBlock } = context;

  return (
    <Box padding={1.2}>
      <Stack spacing={1}>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              RPC
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <CheckDevnetStatus url={url} shouldSendMessage={false} initialIsAlive={true} />
              <Typography fontSize={'0.9rem'}>{url}</Typography>
            </Stack>
          </Stack>
          <Box marginX={1}>
            <IconButton size="small" color="primary" component={RouteLink} to="/app-settings">
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              BLOCK
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>{currentBlock ?? '??'}</Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              MINING
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>Auto</Typography>
            </Stack>
          </Stack>
          <Stack alignItems={'flex-start'}>
            <Typography color={darkTheme.palette.text.secondary} variant="caption">
              CHAIN
            </Typography>
            <Stack direction={'row'} alignItems={'center'} spacing={1}>
              <Typography fontSize={'0.9rem'}>{configData?.chain_id ?? 'Unknown'}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
