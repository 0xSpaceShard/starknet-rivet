import './Popup.css';
import React, { useEffect, useState } from 'react';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { useSharedState } from '../components/context/context';
import { Box, Button, Stack, Typography } from '@mui/material';
import { ChevronRight } from '@mui/icons-material';
import { Route, Routes, Link as RouteLink, useLocation, Navigate } from 'react-router-dom';
import SelectedAccountInfo from '../components/account/selectedAccount';
import { Settings } from '../components/settings/settings';
import { DeploySmartContract } from '../components/settings/deploySmartContract';
import { DeclareSmartContract } from '../components/settings/declareSmartContract';
import { BlockConfiguration } from '../components/settings/blockConfiguration';
import { RpcProvider } from 'starknet-6';
import { Component } from '../components/context/enum';

interface BlockWithTxs {
  block_hash: string;
}

interface PendingBlockWithTxs {
  starknet_version: string;
}

type BlockWithTxsUnion = BlockWithTxs | PendingBlockWithTxs;

export const Popup = () => {
  const context = useSharedState();
  const {
    setSelectedComponent,
    url,
    setTransactionData,
    setSignatureData,
    setCurrentBlock,
    blockInterval,
    configData,
  } = context;

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

  async function fetchCurrentBlockNumber() {
    try {
      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const blockNumber = await provider.getBlockNumber();
      setCurrentBlock(blockNumber);
    } catch (error) {
      console.error('Error fetching block number:', error);
    }
  }

  async function creatNewBlock() {
    try {
      const response = await fetch(`${url}/create_block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await fetchCurrentBlockNumber();
      } else {
        console.error('Error creating block:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating block:', error);
    }
  }

  function isBlockWithTxs(block: BlockWithTxsUnion): block is BlockWithTxs {
    return (block as BlockWithTxs).block_hash !== undefined;
  }

  async function abortBlock(blockNumber: number) {
    try {
      if (configData?.fork_config) {
        if (configData.fork_config?.block_number) {
          if (blockNumber <= configData.fork_config?.block_number) {
            console.error('Error can not abort block: ', blockNumber);
            return;
          }
        }
      }
      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });
      const tx = await provider.getBlockWithTxs(blockNumber);

      if (!isBlockWithTxs(tx)) {
        console.error('Error no block hash');
        return;
      }
      const response = await fetch(`${url}/abort_blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          starting_block_hash: tx.block_hash,
        }),
      });
      if (response.ok) {
        await fetchCurrentBlockNumber();
      } else {
        console.error('Error aborting block:', response.statusText);
      }
    } catch (error) {
      console.error('Error aborting block:', error);
    }
  }

  useEffect(() => {
    const fetchCurrentBlock = async () => {
      try {
        await fetchCurrentBlockNumber();
      } catch (error) {
        console.error('Error fetching current block number:', error);
      }
    };
    if (url && blockInterval instanceof Map && blockInterval.has(url)) {
      let interval = blockInterval.get(url);
      if (interval && interval < 60000) {
        interval = 60000;
      }
      const id = setInterval(() => {
        fetchCurrentBlock();
      }, interval);

      return () => clearInterval(id);
    }
  }, [url, blockInterval]);

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
        <Route
          path="/accounts/:address/blockConfiguration"
          element={
            <BlockConfiguration
              creatNewBlock={creatNewBlock}
              fetchCurrentBlockNumber={fetchCurrentBlockNumber}
              abortBlock={abortBlock}
            />
          }
        />
      </Routes>
    </main>
  );
};
export default Popup;
