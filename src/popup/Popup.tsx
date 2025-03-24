import { useEffect } from 'react';
import { Route, Routes, Outlet, useLocation } from 'react-router-dom';
import { Divider } from '@mui/material';
import PredeployedAccounts from '../components/predeployedAccounts/predeployedAccounts';
import DockerCommandGenerator from '../components/dockerCommand/dockerCommand';
import RegisterRunningDocker from '../components/registerRunningDocker/registerRunningDocker';
import { useSharedState } from '../components/context/context';
import SelectedAccountInfo from '../components/account/selectedAccount';
import { AccountSend } from '../components/account/accountSend';
import { AccountSettings } from '../components/settings/accountSettings';
import { DeploySmartContract } from '../components/settings/deploySmartContract';
import { DeclareSmartContract } from '../components/settings/declareSmartContract';
import { BlockConfiguration } from '../components/settings/blockConfiguration';
import { AddTokenContract } from '../components/settings/addTokenContract';
import BlockDetailsPage from '../components/block/blockDetails';
import { AppSettings } from '../components/settings/appSettings';
import { Home } from '../components/home/home';
import { StatusHeader } from '../components/status/statusHeader';
import { WatchAssetMessage } from '../components/handleWalletMessages/watchAssetMessage';
import { SwitchStarknetChainMessage } from '../components/handleWalletMessages/switchStarknetChainMessage';
import { DeclareContractMessage } from '../components/handleWalletMessages/declareContractMessage';
import { ModifyBalance } from '../components/settings/modifyBalance';
import { fetchCurrentBlockNumber } from '../background/utils';
import { TransactionDetails } from '../components/transaction/TransactionDetails';
import { GasPriceModification } from '../components/settings/gasPriceModification';

import './Popup.css';
import { logError } from '../background/analytics';
import useGetBlockWithTxs from '../api/starknet/hooks/useGetBlockWithTxs';
import { BlockWithTxs } from '../api/starknet/types';
import OnboardingStart from '../components/screens/onboarding/start';
import OnboardingConfigure from '../components/screens/onboarding/configure';
import OnboardingRun from '../components/screens/onboarding/run';
import { useOnboarded } from '../components/hooks/useOnboarded';

export const Popup = () => {
  const context = useSharedState();
  const location = useLocation();
  const {
    selectedUrl: url,
    setTransactionData,
    setSignatureData,
    blockInterval,
    configData,
    setCurrentBlock,
  } = context;
  const { mutateAsync: getBlockWithTxs } = useGetBlockWithTxs();
  const { data: onboarded } = useOnboarded();

  const updateCurrentBlockNumber = async () => {
    const blockNumber = await fetchCurrentBlockNumber();
    if (blockNumber >= 0) {
      setCurrentBlock(blockNumber);
    }
  };

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'EXECUTE_RIVET_TRANSACTION') {
      setTransactionData({ data: message.data, gas_fee: message?.gas_fee, error: message?.error });
    } else if (message.type === 'SIGN_RIVET_MESSAGE') {
      setSignatureData(message.data);
    }
  });

  async function createNewBlock() {
    try {
      const response = await fetch(`${url}/create_block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        await updateCurrentBlockNumber();
      } else {
        logError('Error creating block:', response.statusText);
      }
    } catch (error) {
      logError('Error creating block:', error);
    }
  }

  function isBlockWithTxs(block: BlockWithTxs) {
    return (block as BlockWithTxs).block_hash !== undefined;
  }

  async function abortBlock(blockNumber: number) {
    try {
      if (configData?.fork_config) {
        if (configData.fork_config?.block_number) {
          if (blockNumber <= configData.fork_config?.block_number) {
            logError('Error can not abort block: ', blockNumber);
            return;
          }
        }
      }
      const tx = await getBlockWithTxs(blockNumber);

      if (tx) {
        if (!isBlockWithTxs(tx)) {
          logError('Error no block hash');
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
          await updateCurrentBlockNumber();
        }
      }
    } catch (error) {
      logError('Error aborting block:', error);
    }
  }

  useEffect(() => {
    if (!url) return () => {};

    if (blockInterval instanceof Map && blockInterval.has(url)) {
      let interval = blockInterval.get(url);
      if (interval && interval < 60000) {
        interval = 60000;
      }
      const id = setInterval(() => {
        updateCurrentBlockNumber();
      }, interval);

      return () => clearInterval(id);
    }

    updateCurrentBlockNumber();
    return () => {};
  }, [url, blockInterval]);

  return (
    <main>
      {(onboarded || location.state?.fromOnboarding) && (
        <div className="status-header">
          <StatusHeader />
          <Divider variant="middle" sx={{ marginY: '0.1em' }} />
        </div>
      )}
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/onboarding"
            element={<Outlet />}
            children={[
              <Route index element={<OnboardingStart />} key="start" />,
              <Route path="configure" element={<OnboardingConfigure />} key="configure" />,
              <Route path="run" element={<OnboardingRun />} key="run" />,
            ]}
          />
          <Route path="/app-settings" element={<AppSettings />} />
          <Route path="/command-generator" element={<DockerCommandGenerator />} />
          <Route path="/docker-register" element={<RegisterRunningDocker />} />
          <Route path="/accounts" element={<PredeployedAccounts />} />
          <Route path="/accounts/:address" element={<SelectedAccountInfo />} />
          <Route path="/accounts/:address/settings" element={<AccountSettings />} />
          <Route path="/accounts/:address/declare" element={<DeclareSmartContract />} />
          <Route path="/accounts/:address/deploy" element={<DeploySmartContract />} />
          <Route path="/accounts/:address/add-token-contract" element={<AddTokenContract />} />
          <Route path="/accounts/:address/watch_asset_message" element={<WatchAssetMessage />} />
          <Route
            path="/accounts/:address/declare_contract_message"
            element={<DeclareContractMessage />}
          />
          <Route
            path="/accounts/:address/switch_chain_message"
            element={<SwitchStarknetChainMessage />}
          />
          <Route path="/accounts/:address/modify-balance" element={<ModifyBalance />} />
          <Route path="/accounts/:address/send" element={<AccountSend />} />
          <Route
            path="/block-configuration"
            element={<BlockConfiguration createNewBlock={createNewBlock} abortBlock={abortBlock} />}
          />
          <Route path="/gas-price-modification" element={<GasPriceModification />} />
          <Route path="/block/:blockIndex" element={<BlockDetailsPage />} />
          <Route path="/transaction/:transactionHash" element={<TransactionDetails />} />
        </Routes>
      </div>
    </main>
  );
};
export default Popup;
