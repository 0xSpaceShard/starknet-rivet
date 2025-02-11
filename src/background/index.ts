import { Call, stark, TransactionType } from 'starknet-6';
import { getProvider, getSelectedAccount, parseErrorMessage } from './utils';
import { removeUrlBlockInterval, setUrlBlockInterval } from './blockInterval';
import { declareContract, deployContract } from './contracts';
import { getSelectedUrl } from './syncStorage';
import {
  ActionMessage,
  RequestMessageHandler,
  TransactionMessage,
} from '../components/contractInteraction/messageActions';
import { logError, setupErrorTracking } from './analytics';

console.log('Background script is running');

setupErrorTracking();

// Listener for incoming messages from the extension popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  switch (message.type) {
    case 'GET_EXTENSION_ID':
      sendResponse({ extensionId: chrome.runtime.id });
      break;

    case 'CONNECT_RIVET_DAPP':
      connectRivetDapp(sendResponse);
      break;

    case 'SIMULATE_RIVET_TRANSACTION':
      simulateRivetTransaction(message, sendResponse);
      break;

    case 'EXECUTE_RIVET_TRANSACTION':
      executeRivetTransaction(message, sendResponse);
      break;

    case 'SET_URL_BLOCK_INTERVAL':
      setUrlBlockInterval(message, sendResponse);
      break;

    case 'REMOVE_URL_BLOCK_INTERVAL':
      removeUrlBlockInterval(message, sendResponse);
      break;

    case 'SIGN_RIVET_MESSAGE':
      signRivetMessage(message, sendResponse);
      break;

    case 'RIVET_DECLARE_CONTRACT':
      declareContract(message, sendResponse);
      break;

    case 'RIVET_DEPLOY_CONTRACT':
      deployContract(message, sendResponse);
      break;

    case 'REQUEST_CHAIN_ID_HANDLER':
      requestChainIdHandler(message, sendResponse);
      break;

    case 'WATCH_ASSET_HANDLER':
      watchAssetHandler(message, sendResponse);
      break;

    case 'SWITCH_STARKNET_CHAIN':
      switchStarknetChainHandler(message, sendResponse);
      break;

    case 'REQUEST_DECLARE_CONTRACT':
      declareContractHandler(message, sendResponse);
      break;

    default:
      sendResponse({ error: 'Unknown message type.' });
      break;
  }
  return true;
});

// Function to connect Rivet Dapp
async function connectRivetDapp(sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const url = await getSelectedUrl();
    const selectedAccount = result.selectedAccount || '';

    let accountTabId: number | undefined;
    let urlTabId: number | undefined;

    if (!url) {
      chrome.tabs.create(
        {
          url: chrome.runtime.getURL('popup.html#/docker-register'),
        },
        (tab) => {
          urlTabId = tab.id;
        }
      );
    } else if (selectedAccount === '') {
      chrome.tabs.create(
        {
          url: chrome.runtime.getURL('popup.html#/accounts'),
        },
        (tab) => {
          accountTabId = tab.id;
        }
      );
    }

    if (url && selectedAccount) {
      sendResponse({
        type: 'CONNECT_RIVET_DAPP_RES',
        success: true,
        data: { selectedAccount, url },
      });
    }

    chrome.runtime.onMessage.addListener(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      function onResponseListener(message, sender, sendResponse) {
        if (message.type === 'SELECTED_ACCOUNT_UPDATED') {
          if (accountTabId !== undefined) {
            chrome.tabs.remove(accountTabId);
          }
          if (urlTabId !== undefined) {
            chrome.tabs.remove(urlTabId);
          }
          sendResponse({ success: true, selectedAccount: message.data });
          chrome.runtime.onMessage.removeListener(onResponseListener);
        }
      }
    );
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to simulate a Rivet transaction
async function simulateRivetTransaction(
  message: Extract<TransactionMessage, { type: 'SIMULATE_RIVET_TRANSACTION' }>,
  sendResponse: (response?: {
    type: string;
    data: {
      data?: Call | Call[];
      gas_fee?: string;
      error: string | null;
    };
  }) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (selectedAccount) {
      const acc = await getSelectedAccount();
      const res = await acc.simulateTransaction([
        { type: TransactionType.INVOKE, payload: message.data.transactions },
      ]);
      sendResponse({
        type: 'SIMULATE_RIVET_TRANSACTION_RES',
        data: {
          data: message.data.transactions,
          gas_fee: res[0].fee_estimation.overall_fee,
          error: null,
        },
      });
    } else {
      console.log('No selected account found in storage.');
      sendResponse({
        type: 'SIMULATE_RIVET_TRANSACTION_RES',
        data: {
          error: 'No selected account found in storage.',
        },
      });
    }
  } catch (error) {
    sendResponse({
      type: 'SIMULATE_RIVET_TRANSACTION_RES',
      data: { error: parseErrorMessage(error) },
    });
  }
}

// Function to execute a Rivet transaction
async function executeRivetTransaction(
  message: Extract<TransactionMessage, { type: 'EXECUTE_RIVET_TRANSACTION' }>,
  sendResponse: (response?: {
    type: string;
    data: { transaction_hash?: string; error?: string };
  }) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (!selectedAccount) {
      logError('No selected account found in storage.');
      sendResponse({
        type: 'RIVET_TRANSACTION_FAILED',
        data: { error: 'Error retrieving selected account from storage.' },
      });
      return;
    }

    const popupUrl = chrome.runtime.getURL(`popup.html#/accounts/${selectedAccount.address}`);

    chrome.windows.create(
      {
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600,
      },
      (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = async (responseMessage: any) => {
              try {
                if (responseMessage.type === 'EXECUTE_RIVET_TRANSACTION_RES') {
                  const provider = await getProvider();
                  const acc = await getSelectedAccount();

                  const tx = await acc.execute(responseMessage.data.transactions);
                  await provider.waitForTransaction(tx.transaction_hash);
                  sendResponse({ type: 'EXECUTE_RIVET_TRANSACTION_RES', data: tx });
                }
                if (responseMessage.type === 'RIVET_TRANSACTION_FAILED') {
                  sendResponse({
                    type: 'RIVET_TRANSACTION_FAILED',
                    data: { error: 'User abort' },
                  });
                }
              } catch (error) {
                sendResponse({
                  type: 'RIVET_TRANSACTION_FAILED',
                  data: { error: 'Error executing transaction.' },
                });
              } finally {
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            };

            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, {
                type: 'EXECUTE_RIVET_TRANSACTION',
                data: message.data,
                gas_fee: message?.gas_fee,
                error: message?.error,
              });
            }, 1000);
          }
        }
      }
    );
  } catch (error) {
    logError('Error retrieving selected account from storage.', error);
    sendResponse({
      type: 'RIVET_TRANSACTION_FAILED',
      data: { transaction_hash: '', error: 'Error retrieving selected account from storage.' },
    });
  }
}

// Function to sign a Rivet message
async function signRivetMessage(
  message: Extract<ActionMessage, { type: 'SIGN_RIVET_MESSAGE' }>,
  sendResponse: (response?: any) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (!selectedAccount) {
      logError('No selected account found in storage.');
      sendResponse({ error: 'No selected account found in storage.' });
      return;
    }

    const popupUrl = chrome.runtime.getURL(`popup.html#/accounts/${selectedAccount.address}`);

    chrome.windows.create(
      {
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600,
      },
      (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = async (responseMessage: any) => {
              try {
                if (responseMessage.type === 'SIGN_RIVET_MESSAGE_RES') {
                  const acc = await getSelectedAccount();

                  const signature = await acc.signMessage(responseMessage.data.typedData);
                  const formattedSignature = stark.signatureToDecimalArray(signature);

                  sendResponse({ type: 'SIGN_RIVET_MESSAGE_RES', data: formattedSignature });
                }
                if (responseMessage.type === 'SIGNATURE_RIVET_FAILURE') {
                  sendResponse({ type: 'SIGNATURE_RIVET_FAILURE', data: { error: 'User abort' } });
                }
              } catch (error) {
                sendResponse({
                  type: 'SIGNATURE_RIVET_FAILURE',
                  data: { error: 'Error signing message.' },
                });
              } finally {
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            };

            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: 'SIGN_RIVET_MESSAGE', data: message.data });
            }, 1000);
          }
        }
      }
    );
  } catch (error) {
    logError('Error retrieving selected account from storage.', error);
    sendResponse({ error: 'Error retrieving selected account from storage.' });
  }
}

async function requestChainIdHandler(
  message: Extract<RequestMessageHandler, { type: 'REQUEST_CHAIN_ID_HANDLER' }>,
  sendResponse: (response?: any) => void
) {
  const url = await getSelectedUrl();
  if (url) {
    const configResponse = await fetch(`${url}/config`);
    const configData = await configResponse.json();
    sendResponse({
      type: 'REQUEST_CHAIN_ID_HANDLER_RES',
      data: {
        chainId: configData.chain_id,
      },
    });
  } else {
    sendResponse({
      type: 'REQUEST_CHAIN_ID_HANDLER_RES',
      data: {
        chainId: '0x0',
        error: 'No connection',
      },
    });
  }
}

async function watchAssetHandler(
  message: Extract<RequestMessageHandler, { type: 'WATCH_ASSET_HANDLER' }>,
  sendResponse: (response?: any) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (!selectedAccount) {
      sendResponse({ error: 'No selected account found in storage.' });
      return;
    }

    const popupUrl = chrome.runtime.getURL(
      `popup.html#/accounts/${selectedAccount.address}/watch_asset_message`
    );

    chrome.windows.create(
      {
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600,
      },
      (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = async (responseMessage: any) => {
              try {
                if (responseMessage.type === 'WATCH_ASSET_HANDLER_RES') {
                  sendResponse({ type: 'WATCH_ASSET_HANDLER_RES', data: responseMessage.data });
                }
              } catch (error) {
                sendResponse({
                  type: 'WATCH_ASSET_HANDLER_RES',
                  data: false,
                });
              } finally {
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            };

            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: 'WATCH_ASSET_HANDLER', data: message.data });
            }, 1000);
          }
        }
      }
    );
  } catch (error) {
    sendResponse({ error: 'Error retrieving selected account from storage.' });
  }
}

async function switchStarknetChainHandler(
  message: Extract<RequestMessageHandler, { type: 'SWITCH_STARKNET_CHAIN' }>,
  sendResponse: (response?: any) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (!selectedAccount) {
      sendResponse({ error: 'No selected account found in storage.' });
      return;
    }

    const popupUrl = chrome.runtime.getURL(
      `popup.html#/accounts/${selectedAccount.address}/switch_chain_message`
    );

    chrome.windows.create(
      {
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600,
      },
      (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = async (responseMessage: any) => {
              try {
                if (responseMessage.type === 'SWITCH_STARKNET_CHAIN_RES') {
                  sendResponse({ type: 'SWITCH_STARKNET_CHAIN_RES', data: responseMessage.data });
                }
              } catch (error) {
                sendResponse({
                  type: 'SWITCH_STARKNET_CHAIN_RES',
                  data: false,
                });
              } finally {
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            };

            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: 'SWITCH_STARKNET_CHAIN', data: message.data });
            }, 1000);
          }
        }
      }
    );
  } catch (error) {
    sendResponse({ error: 'Error retrieving selected account from storage.' });
  }
}

async function declareContractHandler(
  message: Extract<RequestMessageHandler, { type: 'REQUEST_DECLARE_CONTRACT' }>,
  sendResponse: (response?: any) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (!selectedAccount) {
      sendResponse({ error: 'No selected account found in storage.' });
      return;
    }

    const popupUrl = chrome.runtime.getURL(
      `popup.html#/accounts/${selectedAccount.address}/declare_contract_message`
    );

    chrome.windows.create(
      {
        url: popupUrl,
        type: 'popup',
        width: 400,
        height: 600,
      },
      (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = async (responseMessage: any) => {
              try {
                if (responseMessage.type === 'REQUEST_DECLARE_CONTRACT_RES') {
                  await declareContract(message.data.payload, (response) => {
                    sendResponse({
                      type: 'REQUEST_DECLARE_CONTRACT_RES',
                      data: response,
                    });
                  });
                }
              } catch (error) {
                sendResponse({
                  type: 'REQUEST_DECLARE_CONTRACT_RES',
                  data: { error: 'timeout' },
                });
              } finally {
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            };

            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, {
                type: 'REQUEST_DECLARE_CONTRACT',
                data: message.data,
              });
            }, 1000);
          }
        }
      }
    );
  } catch (error) {
    sendResponse({
      type: 'REQUEST_DECLARE_CONTRACT_RES',
      data: error,
    });
  }
}
