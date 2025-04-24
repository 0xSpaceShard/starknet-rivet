import { useState, useEffect } from 'react';
import { useNavigate, Link as RouteLink } from 'react-router-dom';
import { Stack, Box, Button, Typography, Divider, Grid, IconButton, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, CropSquare, ViewSidebar } from '@mui/icons-material';
import { createArgentAccount, createOpenZeppelinAccount } from '../../background/utils';
import { useSharedState } from '../context/dataContext';
import { Spinner } from '../utils/spinner';
import { getUrlConfig } from '../../background/syncStorage';
import { UrlConfig } from '../context/interfaces';
import { useViewMode } from '../context/viewContext';
import { useL1Node } from '../hooks/useL1Node';

export const AppSettings = () => {
  const navigate = useNavigate();
  const context = useSharedState();
  const { selectedUrl: url, updateSelectedAccount, updateCurrentBalance } = context;
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [config, setConfig] = useState<UrlConfig | null>(null);
  const { data: l1NodePort } = useL1Node();

  const getConfig = async () => {
    const urlConfig = await getUrlConfig();
    setConfig(urlConfig);
  };
  useEffect(() => {
    getConfig();
  }, [url]);

  const mode = useViewMode();

  const onSidepanelOpen = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: true,
      });
      // @ts-expect-error - open() not typed in current @types/chrome
      await chrome.sidePanel.open({ tabId: tab.id });

      chrome.extension.getViews({ type: 'popup' }).forEach((w) => w.close());

      await chrome.runtime.sendMessage({
        type: 'SET_VIEWMODE',
        data: 'sidepanel',
      });
    }
  };

  const onPopupOpen = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.setOptions({
        tabId: tab.id,
        path: 'sidepanel.html',
        enabled: false,
      });

      await chrome.runtime.sendMessage({
        type: 'SET_VIEWMODE',
        data: 'popup',
      });
    }
  };

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
          <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
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
            {mode === 'popup' ? (
              <Box>
                <Tooltip title={'Sidepanel view'} sx={{ marginX: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onSidepanelOpen}
                    aria-haspopup="true"
                    sx={{
                      marginRight: '1em',
                    }}
                  >
                    <ViewSidebar fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box>
                <Tooltip title={'Popup view'} sx={{ marginX: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={onPopupOpen}
                    aria-haspopup="true"
                    sx={{
                      marginRight: '1em',
                    }}
                  >
                    <CropSquare fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
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
            <Box>
              <Button
                variant="text"
                component={RouteLink}
                to="/gas-price-modification"
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                Modify Gas Price
                <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
                  <ChevronRight />
                </Box>
              </Button>
            </Box>
            <Box>
              <Button
                variant="text"
                component={RouteLink}
                to={l1NodePort ? '/l1-l2-data' : '/l1-l2-onboarding'}
                fullWidth
                sx={{
                  height: 48,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                L1 - L2 Messaging
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
                  const fetchUrl = `${url}/account_balance?address=${account.address}&unit=FRI`;

                  const strkRes = await fetch(fetchUrl);

                  const strk = await strkRes.json();

                  await updateCurrentBalance(BigInt(strk.amount));
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
                disabled={!config?.argentClassExists}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const account = await createArgentAccount();
                  const fetchUrl = `${url}/account_balance?address=${account.address}&unit=FRI`;

                  const strkRes = await fetch(fetchUrl);

                  const strk = await strkRes.json();

                  await updateCurrentBalance(BigInt(strk.amount));
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
