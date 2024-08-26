import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RpcProvider } from 'starknet-6';
import { Divider } from '@mui/material';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { useSharedState } from '../components/context/context';
import SelectedAccountInfo from '../components/account/selectedAccount';
import { AccountSettings } from '../components/settings/accountSettings';
import { DeploySmartContract } from '../components/settings/deploySmartContract';
import { DeclareSmartContract } from '../components/settings/declareSmartContract';
import { BlockConfiguration } from '../components/settings/blockConfiguration';
import { AddTokenContract } from '../components/settings/addTokenContract';
import BlockDetailsPage from '../components/block/blockDetails';
import { AppSettings } from '../components/settings/appSettings';
import { Home } from '../components/home/home';
import { StatusHeader } from '../components/status/statusHeader';

import './Popup.css';
import { ModifyBalance } from '../components/settings/modifyBalance';

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
    selectedUrl: url,
    setTransactionData,
    setSignatureData,
    setCurrentBlock,
    blockInterval,
    configData,
  } = context;

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
    }
    if (url) {
      fetchCurrentBlock();
    }
  }, [url, blockInterval]);

  return (
    <main>
      <StatusHeader />
      <Divider variant="middle" sx={{ marginY: '0.1em' }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app-settings" element={<AppSettings />} />
        <Route path="/command-generator" element={<DockerCommandGenerator />} />
        <Route path="/docker-register" element={<RegisterRunningDocker />} />
        <Route path="/accounts" element={<PredeployedAccounts />} />
        <Route path="/accounts/:address" element={<SelectedAccountInfo />} />
        <Route path="/accounts/:address/settings" element={<AccountSettings />} />
        <Route path="/accounts/:address/declare" element={<DeclareSmartContract />} />
        <Route path="/accounts/:address/deploy" element={<DeploySmartContract />} />
        <Route path="/accounts/:address/add-token-contract" element={<AddTokenContract />} />
        <Route path="/accounts/:address/modify-balance" element={<ModifyBalance />} />
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
