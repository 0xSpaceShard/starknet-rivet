import { useState } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { Stack, Box, Button, Typography, Divider, Grid } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { createOpenZeppelinAccount } from '../../background/utils';
import { useSharedState } from '../context/context';
import { Spinner } from '../utils/spinner';

export const AppSettings = () => {
  const navigate = useNavigate();
  const context = useSharedState();
  const { selectedUrl: url, updateSelectedAccount, updateCurrentBalance } = context;
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  return (
    <section>
      {isCreatingAccount ? (
        <Grid container direction={'column'} alignItems={'center'}>
          <Box marginTop={2} marginBottom={3}>
            <Typography variant="h6">Creating Account...</Typography>
          </Box>
          <Spinner />
        </Grid>
      ) : (
        <>
          <Stack direction={'row'} justifyContent={'flex-start'}>
            <Box>
              <Button
                size="small"
                variant={'text'}
                startIcon={<ChevronLeft />}
                onClick={() => navigate('/')}
                sx={{
                  padding: '8px 10px',
                }}
              >
                Back
              </Button>
            </Box>
          </Stack>
          <Stack spacing={0}>
            <Box>
              <Button
                variant="text"
                component={RouteLink}
                to="/command-generator"
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Docker Command Generator
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
            </Box>
            <Box>
              <Button
                variant="text"
                component={RouteLink}
                to="/docker-register"
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Register Running Docker
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
            </Box>
            <Box>
              <Button
                variant="text"
                component={RouteLink}
                to="/block-configuration"
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Block Configuration
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
            </Box>
            <Divider variant="middle" />
            <Box marginTop={2} marginBottom={1}>
              <Typography variant="body2">Account Creation</Typography>
            </Box>
            <Box>
              <Button
                variant="text"
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCreatingAccount(true);
                  const account = await createOpenZeppelinAccount();
                  const response = await fetch(`${url}/account_balance?address=${account.address}`);
                  const accountBalance = await response?.json();
                  await updateCurrentBalance(BigInt(accountBalance?.amount));
                  await updateSelectedAccount(account);
                  navigate(`/accounts/${account.address}`, { state: { type: account.type } });
                }}
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Open Zeppelin
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
              <Button
                variant="text"
                disabled
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // const account = await createArgentAccount();
                  // const response = await fetch(`${url}/account_balance?address=${account.address}`);
                  // const accountBalance = await response?.json();
                }}
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Argent
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
              <Button
                variant="text"
                disabled
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Braavos
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
              <Button
                variant="text"
                disabled
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Ethereum
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
            </Box>
          </Stack>
        </>
      )}
    </section>
  );
};
