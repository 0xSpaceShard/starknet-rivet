import { Call, stark, TransactionType } from 'starknet-6';
import { getProvider, getSelectedAccount, parseErrorMessage } from './utils';
import { getUrl, setUrl } from './url';
import { getUrlList, removeUrlFromList, setNewUrlToList, updateUrlFromList } from './urlList';
import { removeUrlBlockInterval, setUrlBlockInterval } from './blockInterval';
import { declareContract, deployContract, updateAccountContracts } from './contracts';
import { getUrlFromSyncStorage } from './storage';
import { SlectedAccountMessage } from './interface';
import {
  ActionMessage,
  TransactionMessage,
} from '../components/contractInteraction/messageActions';
import { AccountData } from '../components/context/interfaces';

console.log('Background script is running');

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

    case 'SET_URL':
      setUrl(message, sendResponse);
      break;

    case 'GET_URL':
      getUrl(sendResponse);
      break;

    case 'SET_NEW_URL_TO_LIST':
      setNewUrlToList(message, sendResponse);
      break;

    case 'GET_URL_LIST':
      getUrlList(sendResponse);
      break;

    case 'REMOVE_URL_FROM_LIST':
      removeUrlFromList(message, sendResponse);
      break;

    case 'UPDATE_URL_FROM_LIST':
      updateUrlFromList(message, sendResponse);
      break;

    case 'SET_URL_BLOCK_INTERVAL':
      setUrlBlockInterval(message, sendResponse);
      break;

    case 'REMOVE_URL_BLOCK_INTERVAL':
      removeUrlBlockInterval(message, sendResponse);
      break;

    case 'SET_SELECTED_ACCOUNT':
      setSelectedAccount(message, sendResponse);
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

    case 'UPDATE_ACCOUNT_CONTRACTS':
      updateAccountContracts(message, sendResponse);
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
    const url = await getUrlFromSyncStorage();
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
        data: { selectedAccount: selectedAccount, url: url },
      });
    }

    chrome.runtime.onMessage.addListener(
      function onResponseListener(message, sender, sendResponse) {
        if (message.type === 'SET_SELECTED_ACCOUNT') {
          if (accountTabId !== undefined) {
            chrome.tabs.remove(accountTabId);
          }
          if (urlTabId !== undefined) {
            chrome.tabs.remove(urlTabId);
          }
          sendResponse({ success: true, selectedAccount: message.data.selectedAccount });
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
    const selectedAccount = result.selectedAccount;

    if (!selectedAccount) {
      console.error('No selected account found in storage.');
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

                  const tx = await acc.execute(message.data.transactions);
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
    console.error('Error retrieving selected account from storage.', error);
    sendResponse({
      type: 'RIVET_TRANSACTION_FAILED',
      data: { transaction_hash: '', error: 'Error retrieving selected account from storage.' },
    });
  }
}

// Function to set selected account address
async function setSelectedAccount(
  message: SlectedAccountMessage,
  sendResponse: (response?: {
    success: boolean;
    selectedAccount?: AccountData | null;
    error?: string;
  }) => void
) {
  try {
    await chrome.storage.sync.set({ selectedAccount: message.data.selectedAccount });
    await chrome.storage.local.set({ selectedAccount: message.data.selectedAccount });

    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(
        tab.id as number,
        {
          type: 'UPDATE_SELECTED_ACCOUNT',
          data: message.data.selectedAccount,
        },
        (response) => {
          if (chrome.runtime.lastError) {
          } else {
            console.log(`Message sent to tab ${tab.id}:`, response);
          }
        }
      );
    });
    sendResponse({ success: true, selectedAccount: message.data.selectedAccount });
  } catch (error) {
    sendResponse({ success: false, error: parseErrorMessage(error) });
  }
}

// Function to sign a Rivet message
async function signRivetMessage(
  message: Extract<ActionMessage, { type: 'SIGN_RIVET_MESSAGE' }>,
  sendResponse: (response?: any) => void
) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const selectedAccount = result.selectedAccount;

    if (!selectedAccount) {
      console.error('No selected account found in storage.');
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
    console.error('Error retrieving selected account from storage.', error);
    sendResponse({ error: 'Error retrieving selected account from storage.' });
  }
}
