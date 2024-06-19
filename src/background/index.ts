import { Account, RpcProvider, stark, TransactionType } from "starknet-6";

console.log('Background script is running');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

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

    case 'SET_SELECTED_ACCOUNT':
      setSelectedAccount(message, sendResponse);
      break;

    case 'SIGN_RIVET_MESSAGE':
      signRivetMessage(message, sendResponse);
      break;

    default:
      sendResponse({ error: 'Unknown message type.' });
      break;
  }
  return true;
});

async function connectRivetDapp(sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const urlResult = await chrome.storage.sync.get(['url']);
    const url = urlResult.url;
    const selectedAccount = result.selectedAccount || '';

    let accountTabId: number | undefined;
    let urlTabId: number | undefined;

    if (!url) {
      chrome.tabs.create({
        url: chrome.runtime.getURL('popup.html#/docker-register')
      }, (tab) => {
        urlTabId = tab.id;
      });
    }

    if (selectedAccount === '') {
      chrome.tabs.create({
        url: chrome.runtime.getURL('popup.html#/accounts')
      }, (tab) => {
        accountTabId = tab.id;
      });
    }

    if (url && selectedAccount) {
      sendResponse({
        type: "CONNECT_RIVET_DAPP_RES",
        data: { data: selectedAccount, url: url }
      });
    }

    chrome.runtime.onMessage.addListener(function onResponseListener(message, sender, sendResponse) {
      if (message.type === "SET_SELECTED_ACCOUNT") {
        if (accountTabId !== undefined) {
          chrome.tabs.remove(accountTabId);
        }
        if (urlTabId !== undefined) {
          chrome.tabs.remove(urlTabId);
        }
        sendResponse({ success: true });
        chrome.runtime.onMessage.removeListener(onResponseListener);
      }
    });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function simulateRivetTransaction(message: any, sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const selectedAccount = result.selectedAccount;

    if (selectedAccount) {
      const resultUrl = await chrome.storage.sync.get(['url']);
      const url = resultUrl.url;
      const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
      const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);

      const res = await acc.simulateTransaction([{ type: TransactionType.INVOKE, payload: message.data.transactions }]);
      sendResponse({
        type: "SIMULATE_RIVET_TRANSACTION_RES",
        data: { data: message.data.transactions, gas_fee: res[0].fee_estimation.overall_fee, error: null }
      });
    } else {
      console.log('No selected account found in storage.');
      sendResponse({ type: "SIMULATE_RIVET_TRANSACTION_RES", data: { error: 'No selected account found in storage.' } });
    }
  } catch (error) {
    sendResponse({ type: "SIMULATE_RIVET_TRANSACTION_RES", data: { error: parseErrorMessage(error) } });
  }
}

async function executeRivetTransaction(message: any, sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const selectedAccount = result.selectedAccount;

    if (!selectedAccount) {
      console.error('No selected account found in storage.');
      sendResponse({ type: "RIVET_TRANSACTION_FAILED", data: { error: 'Error retrieving selected account from storage.'} });
      return;
    }

    const popupUrl = chrome.runtime.getURL(`popup.html#/accounts/${selectedAccount.address}`);

    chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600
    }, (window) => {
      if (window && window.tabs && window.tabs[0]) {
        const tabId = window.tabs[0].id;
        if (tabId) {
          const onResponseListener = async (responseMessage: any) => {
            try {
              if (responseMessage.type === 'EXECUTE_RIVET_TRANSACTION_RES') {
                const resultUrl = await chrome.storage.sync.get(['url']);
                const url = resultUrl.url;
                const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
                const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);

                const tx = await acc.execute(message.data.transactions);
                await provider.waitForTransaction(tx.transaction_hash);

                sendResponse({ type: "EXECUTE_RIVET_TRANSACTION_RES", data: tx });
              }
              if (responseMessage.type === 'RIVET_TRANSACTION_FAILED') {
                sendResponse({ type: "RIVET_TRANSACTION_FAILED", data: { error: 'User abort' } });
              }
            } catch (error) {
              sendResponse({ type: "RIVET_TRANSACTION_FAILED", data: { error: 'Error executing transaction.' } });
            } finally {
              chrome.runtime.onMessage.removeListener(onResponseListener);
            }
          };

          chrome.runtime.onMessage.addListener(onResponseListener);
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: "EXECUTE_RIVET_TRANSACTION", data: message.data, gas_fee: message?.gas_fee, error: message?.error });
          }, 1000);
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving selected account from storage.', error);
    sendResponse({ type: "RIVET_TRANSACTION_FAILED", data: { error: 'Error retrieving selected account from storage.'} });
  }
}

async function setUrl(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ url: message.url });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function setSelectedAccount(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ selectedAccount: message.selectedAccount });
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      chrome.tabs.sendMessage(tab.id as number, { type: 'UPDATE_SELECTED_ACCOUNT', data: { data: message.selectedAccount } });
    }
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

async function signRivetMessage(message: any, sendResponse: (response?: any) => void) {
  try {
    const result = await chrome.storage.sync.get(['selectedAccount']);
    const selectedAccount = result.selectedAccount;

    if (!selectedAccount) {
      console.error('No selected account found in storage.');
      sendResponse({ error: 'No selected account found in storage.' });
      return;
    }

    const popupUrl = chrome.runtime.getURL(`popup.html#/accounts/${selectedAccount.address}`);

    chrome.windows.create({
      url: popupUrl,
      type: 'popup',
      width: 400,
      height: 600
    }, (window) => {
      if (window && window.tabs && window.tabs[0]) {
        const tabId = window.tabs[0].id;
        if (tabId) {
          const onResponseListener = async (responseMessage: any) => {
            try {
              if (responseMessage.type === 'SIGN_RIVET_MESSAGE_RES') {
                const resultUrl = await chrome.storage.sync.get(['url']);
                const url = resultUrl.url;
                const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });
                const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);

                const signature = await acc.signMessage(responseMessage.data.typedData);
                const formattedSignature = stark.signatureToDecimalArray(signature);

                sendResponse({ type: "SIGN_RIVET_MESSAGE_RES", data: formattedSignature }); 
              }
              if (responseMessage.type === 'SIGNATURE_RIVET_FAILURE') {
                sendResponse({ type: "SIGNATURE_RIVET_FAILURE", data: { error: 'User abort' } });
              }
            } catch (error) {
              sendResponse({ type: "SIGNATURE_RIVET_FAILURE", data: { error: 'Error executing transaction.' } });
            } finally {
              chrome.runtime.onMessage.removeListener(onResponseListener);
            }
          };

          chrome.runtime.onMessage.addListener(onResponseListener);
          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, { type: "SIGN_RIVET_MESSAGE", data: message.data });
          }, 1000);
        }
      }
    });
  } catch (error) {
    console.error('Error retrieving selected account from storage.', error);
    sendResponse({ error: 'Error retrieving selected account from storage.' });
  }
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