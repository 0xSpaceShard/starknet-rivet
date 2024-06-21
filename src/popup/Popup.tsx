import './Popup.css';
import React from 'react';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { Component, useSharedState } from '../components/context/context';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { Route, Routes, Link as RouteLink, useLocation, Navigate } from 'react-router-dom';
import SelectedAccountInfo from '../components/account/selectedAccount';
import { Settings } from '../components/settings/settings';
import { DeploySmartContract } from '../components/settings/deploySmartContract';
import { DeclareSmartContract } from '../components/settings/declareSmartContract';

export const Popup = () => {
  const context = useSharedState();
  const { setSelectedComponent, url, setTransactionData, setSignatureData } = context;

  const switchComponent = (newSelectedComponent: Component) => {
    if (newSelectedComponent === Component.Accounts && !url) {
      setSelectedComponent(null);
      return;
    }
    setSelectedComponent(newSelectedComponent);
  };
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXECUTE_RIVET_TRANSACTION') {
      setTransactionData({ data: message.data, gas_fee: message?.gas_fee, error: message?.error });
    } else if (message.type === 'SIGN_RIVET_MESSAGE') {
      setSignatureData(message.data);
    }
  });

  const ComponentMenu = () => (
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
          onClick={() => switchComponent(Component.CommandGenerator)}
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
          onClick={() => switchComponent(Component.DockerRegister)}
        >
          Register Running Docker
          <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
            <ChevronRight />
          </Box>
        </Button>
      </Box>
      {url ? (
        <Box>
          <Button
            variant="text"
            component={RouteLink}
            to="/accounts"
            fullWidth
            sx={{
              height: 48,
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
            onClick={() => switchComponent(Component.Accounts)}
          >
            Show Predeployed Accounts
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
      ) : (
        <Box height={48} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant="caption">No predeployed accounts</Typography>
        </Box>
      )}
    </Stack>
  );

  return (
    <main>
      <Routes>
        <Route path="/" element={<ComponentMenu />} />
        <Route path="/command-generator" element={<DockerCommandGenerator />} />
        <Route path="/docker-register" element={<RegisterRunningDocker />} />
        <Route path="/accounts" element={<PredeployedAccounts />} />
        <Route path="/accounts/:address" element={<SelectedAccountInfo />} />
        <Route path="/accounts/:address/settings" element={<Settings />} />
        <Route path="/accounts/:address/declare" element={<DeclareSmartContract />} />
        <Route path="/accounts/:address/deploy" element={<DeploySmartContract />} />
      </Routes>
    </main>
  );
};
export default Popup;
