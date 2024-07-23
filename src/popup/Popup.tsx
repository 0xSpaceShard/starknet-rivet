import React, { ReactNode, useEffect, useState } from 'react';
import { Route, Routes, Link as RouteLink, useNavigate } from 'react-router-dom';
import { RpcProvider } from 'starknet-6';
import { Box, Button, Divider, IconButton, Stack, Typography, Tabs, Tab } from '@mui/material';
import { ChevronLeft, ChevronRight, Settings as SettingsIcon } from '@mui/icons-material';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import PredeployedAccountsInline from '../components/predeployedAccounts/predeployedAccountsInline';
import BlockList from '../components/block/BlockList';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { useSharedState } from '../components/context/context';
import SelectedAccountInfo from '../components/account/selectedAccount';
import { Settings } from '../components/settings/settings';
import { DeploySmartContract } from '../components/settings/deploySmartContract';
import { DeclareSmartContract } from '../components/settings/declareSmartContract';
import { BlockConfiguration } from '../components/settings/blockConfiguration';
import { Component } from '../components/context/enum';
import { AddTokenContract } from '../components/settings/addTokenContract';
import CheckDevnetStatus from '../components/checkDevnetStatus/checkDevnetStatus';
import { darkTheme } from '..';
import './Popup.css';
import { shortenAddress } from '../components/utils/utils';
import BlockDetailsPage from '../components/block/blockDetails';

interface BlockWithTxs {
  block_hash: string;
}

interface PendingBlockWithTxs {
  starknet_version: string;
}

type BlockWithTxsUnion = BlockWithTxs | PendingBlockWithTxs;

const dummyTransactionData = [
  { acc: '0x4532bdcad3492a01bafab5abb3f4b8ba49b297d13414898372a6abe51e10904', amount: 1.31 },
  { acc: '0x40cfb15b3c9cb2943ebb6b3b7fa846221a55d5c3ec71d7646989515a539938e', amount: 0.1 },
  { acc: '0x24a398a0c9bcfb0f7af3f112c43c63aa8bf67f91ec36b39793b0c338b2a9bed', amount: 2.23 },
  { acc: '0x226974140fb79ee528b7b6a23783527a76915105f786416b28f0ede0f02764b', amount: 0.01 },
  { acc: '0x5b29914c8fc3c61b33e149c2fac7705c4dafcd87e7706dd9798643d33c118f6', amount: 31.34 },
  { acc: '0x7ca26ae9818edd447df722427af88fda4b4e529e6156c63520a9e3729c2061e', amount: 22 },
  { acc: '0x53a6720c0d3ca6e79b1e35bc3882185c994b47c3ea8c8a3012202e5cb7b8fb6', amount: 0.11 },
  { acc: '0x6723910b48b49cdf421d20b1f38d822ea9a22ad982dafa6e8344a82ebf6907f', amount: 0.24 },
];

export const Popup = () => {
  const navigate = useNavigate();
  const context = useSharedState();
  const {
    setSelectedComponent,
    url,
    setTransactionData,
    setSignatureData,
    setCurrentBlock,
    blockInterval,
    configData,
    currentBlock,
    setUrl,
  } = context;

  const switchComponent = (newSelectedComponent: Component) => {
    if (newSelectedComponent === Component.Accounts && !url) {
      setSelectedComponent(null);
      return;
    }
    setSelectedComponent(newSelectedComponent);
  };
  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
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

  // eslint-disable-next-line consistent-return
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
    } else if (url) {
      fetchCurrentBlock();
    }
  }, [url, blockInterval]);

  const ComponentMenu = () => (
    <section>
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
            // onClick={() => switchComponent(Component.DockerRegister)}
          >
            Block Configuration
            <Box display={'flex'} alignItems={'center'} paddingRight={2} paddingLeft={4}>
              <ChevronRight />
            </Box>
          </Button>
        </Box>
        {/* {url ? (
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
        )} */}
      </Stack>
    </section>
  );

  const StatusHeader = () => {
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

  const Home = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const a11yProps = (index: number) => ({
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    });

    if (!url) {
      return (
        <Box height={48} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant="caption">Not connected</Typography>
        </Box>
      );
    }

    const CustomTabPanel: React.FC<{ idx: number; children: ReactNode }> = ({ idx, children }) => {
      return (
        <div
          role="tabpanel"
          hidden={selectedTab !== idx}
          id={`simple-tabpanel-${idx}`}
          aria-labelledby={`simple-tab-${idx}`}
        >
          {selectedTab === idx && <Box sx={{ pt: 1 }}>{children}</Box>}
        </div>
      );
    };

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 0.1, borderColor: 'divider' }}>
          <Tabs
            centered
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
            aria-label="Home Tabs"
          >
            <Tab sx={{ fontSize: '0.8rem' }} label="Accounts" {...a11yProps(0)} />
            <Tab sx={{ fontSize: '0.8rem' }} label="Blocks" {...a11yProps(1)} />
            <Tab sx={{ fontSize: '0.8rem' }} label="Transactions" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel idx={0}>
          <PredeployedAccountsInline />
        </CustomTabPanel>
        <CustomTabPanel idx={1}>
          <BlockList fetchCurrentBlockNumber={fetchCurrentBlockNumber} />
        </CustomTabPanel>
        <CustomTabPanel idx={2}>
          <section>
            <Stack marginBottom={1}>
              {dummyTransactionData.map((transaction, index) => (
                <Box key={index}>
                  <Button
                    fullWidth
                    variant="text"
                    sx={{
                      textTransform: 'none',
                      paddingY: 1,
                      paddingX: 2,
                      color: darkTheme.palette.text.secondary,
                    }}
                  >
                    <Typography width={'70%'} whiteSpace={'nowrap'}>
                      {shortenAddress(transaction.acc)}
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end" width={'30%'}>
                      {transaction.amount} ETH
                    </Stack>
                  </Button>
                </Box>
              ))}
            </Stack>
          </section>
        </CustomTabPanel>
      </Box>
    );
  };

  return (
    <main>
      <StatusHeader />
      <Divider variant="middle" sx={{ marginY: '0.1em' }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app-settings" element={<ComponentMenu />} />
        <Route path="/command-generator" element={<DockerCommandGenerator />} />
        <Route path="/docker-register" element={<RegisterRunningDocker />} />
        <Route path="/accounts" element={<PredeployedAccounts />} />
        <Route path="/accounts/:address" element={<SelectedAccountInfo />} />
        <Route path="/accounts/:address/settings" element={<Settings />} />
        <Route path="/accounts/:address/declare" element={<DeclareSmartContract />} />
        <Route path="/accounts/:address/deploy" element={<DeploySmartContract />} />
        <Route path="/accounts/:address/add-token-contract" element={<AddTokenContract />} />
        <Route
          path="/block-configuration"
          element={
            <BlockConfiguration
              creatNewBlock={creatNewBlock}
              fetchCurrentBlockNumber={fetchCurrentBlockNumber}
              abortBlock={abortBlock}
            />
          }
        />
        <Route path="/block/:blockIndex" element={<BlockDetailsPage />} />
      </Routes>
    </main>
  );
};
export default Popup;
