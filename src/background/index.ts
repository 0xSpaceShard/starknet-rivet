import { Account, RpcProvider, stark, TransactionType } from 'starknet-6';

console.log('background is running');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  switch (message.type) {
    case 'GET_EXTENSION_ID':
      sendResponse({ extensionId: chrome.runtime.id });
      return true;

    case 'CONNECT_RIVET_DAPP':
      connectRivetDapp(sendResponse);
      return true;

    case 'SIMULATE_RIVET_TRANSACTION':
      simulateRivetTransaction(message, sendResponse);
      return true;

    case 'EXECUTE_RIVET_TRANSACTION':
      executeRivetTransaction(message, sendResponse);
      return true;

    case 'SET_URL':
      setUrl(message, sendResponse);
      return true;

    case 'SET_SELECTED_ACCOUNT':
      setSelectedAccount(message, sendResponse);
      return true;

    case 'SIGN_RIVET_MESSAGE':
      signRivetMessage(message, sendResponse);
      return true;

    default:
      sendResponse({ error: 'Unknown message type.' });
      return true;
  }
});

async function connectRivetDapp(sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const urlResult = await chrome.storage.sync.get(['url']);
    const url = urlResult.url || 'http://localhost:5050';

    const selectedAccount = result.selectedAccount || '';
    if (selectedAccount === '') {
      chrome.tabs.create({
        url: chrome.runtime.getURL('popup.html'),
      });
    }

    sendResponse({
      type: 'CONNECT_RIVET_DAPP_RES',
      data: { data: selectedAccount, url },
    });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function simulateRivetTransaction(message: any, sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const { selectedAccount } = result;

    if (selectedAccount) {
      const resultUrl = await chrome.storage.sync.get(['url']);
      const { url } = resultUrl;
      const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
      const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);

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
        data: { error: 'No selected account found in storage.' },
      });
    }
  } catch (error) {
    sendResponse({
      type: 'SIMULATE_RIVET_TRANSACTION_RES',
      data: { error: parseErrorMessage(error) },
    });
  }
}

async function executeRivetTransaction(message: any, sendResponse: (response?: any) => void) {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL('popup.html'),
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
                const result = await chrome.storage.sync.get(['selectedAccount']);
                const { selectedAccount } = result;

                if (selectedAccount) {
                  const resultUrl = await chrome.storage.sync.get(['url']);
                  const { url } = resultUrl;
                  const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
                  const acc = new Account(
                    provider,
                    selectedAccount.address,
                    selectedAccount.private_key
                  );

                  const tx = await acc.execute(message.data.transactions);
                  // const res = await provider.waitForTransaction(tx.transaction_hash);

                  sendResponse({ type: 'EXECUTE_RIVET_TRANSACTION_RES', data: tx });
                } else {
                  console.error('No selected account found in storage.');
                  sendResponse({ error: 'No selected account found in storage.' });
                }
              }
              if (responseMessage.type === 'RIVET_TRANSACTION_FAILED') {
                sendResponse({ type: 'RIVET_TRANSACTION_FAILED', data: { error: 'User abort' } });
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
}

async function setUrl(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ url: message.url });
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id as number, {
        type: 'UPDATE_URL',
        data: { data: message.url },
      });
    });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function setSelectedAccount(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ selectedAccount: message.selectedAccount });
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id as number, {
        type: 'UPDATE_SELECTED_ACCOUNT',
        data: { data: message.selectedAccount },
      });
    });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function signRivetMessage(message: any, sendResponse: (response?: any) => void) {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL('popup.html'),
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
                const result = await chrome.storage.sync.get(['selectedAccount']);
                const { selectedAccount } = result;

                if (selectedAccount) {
                  const resultUrl = await chrome.storage.sync.get(['url']);
                  const { url } = resultUrl;
                  const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
                  const acc = new Account(
                    provider,
                    selectedAccount.address,
                    selectedAccount.private_key
                  );

                  const signature = await acc.signMessage(responseMessage.data.typedData);
                  const formattedSignature = stark.signatureToDecimalArray(signature);

                  sendResponse({ type: 'SIGN_RIVET_MESSAGE_RES', data: formattedSignature });
                } else {
                  console.error('No selected account found in storage.');
                  sendResponse({
                    type: 'SIGNATURE_RIVET_FAILURE',
                    error: 'No selected account found in storage.',
                  });
                }
              }
              if (responseMessage.type === 'SIGNATURE_RIVET_FAILURE') {
                sendResponse({ type: 'SIGNATURE_RIVET_FAILURE', data: { error: 'User abort' } });
              }
            } catch (error) {
              sendResponse({
                type: 'SIGNATURE_RIVET_FAILURE',
                data: { error: 'Error executing transaction.' },
              });
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
}

function parseErrorMessage(error: any): string {
  try {
    const errorObject = JSON.parse(error.message);
    if (errorObject.revert_error) {
      return errorObject.revert_error;
    }
    return error.message;
  } catch (e) {
    return error.message;
  }
}
