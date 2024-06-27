import { Account, Calldata, CallData, RpcProvider, stark, TransactionType } from 'starknet-6';

console.log('Background script is running');

export interface ListOfDevnet {
  url: string;
  isAlive: boolean;
}

// Listener for Chrome alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  const alarmName = alarm.name;

  if (alarmName.startsWith('mintBlockAlarm_')) {
    const url = alarmName.replace('mintBlockAlarm_', '');
    mintBlock(url);
  }
});

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
    const urlResult = await chrome.storage.sync.get(['url']);
    const url = urlResult.url;
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
    }

    if (selectedAccount === '') {
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
        data: { data: selectedAccount, url: url },
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
          sendResponse({ success: true });
          chrome.runtime.onMessage.removeListener(onResponseListener);
        }
      }
    );
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to simulate a Rivet transaction
async function simulateRivetTransaction(message: any, sendResponse: (response?: any) => void) {
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

// Function to execute a Rivet transaction
async function executeRivetTransaction(message: any, sendResponse: (response?: any) => void) {
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
                  for (let index = 0; index <= 3; index++) {
                    await provider.getBlockTransactionsTraces(index);
                  }
                  sendResponse({ type: 'EXECUTE_RIVET_TRANSACTION_RES', data: tx });
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
  } catch (error) {
    console.error('Error retrieving selected account from storage.', error);
    sendResponse({
      type: 'RIVET_TRANSACTION_FAILED',
      data: { error: 'Error retrieving selected account from storage.' },
    });
  }
}

// Function to set URL in Chrome storage
async function setUrl(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ url: message.url });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to save a new URL to the list of devnet networks in Chrome storage
async function saveUrlListToSyncStorage(urlList: ListOfDevnet[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ ['urlList']: urlList }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// Function to set a new devnet URL to URL list
async function setNewUrlToList(message: any, sendResponse: (response?: any) => void) {
  try {
    await addUrlToUrlListInSyncStorage(message.item);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to set a new devnet URL to URL list
async function removeUrlFromList(message: any, sendResponse: (response?: any) => void) {
  try {
    await removeUrlFromListInSyncStorage(message.url);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to update devnet URL from URL list
async function updateUrlFromList(message: any, sendResponse: (response?: any) => void) {
  try {
    await updateUrlFromListInSyncStorage(message.url, message.isAlive);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to get devnet URL list
async function getUrlList(sendResponse: (response?: any) => void) {
  try {
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to retrieve devnet URL list from Chrome sync storage
async function getUrlListFromSyncStorage(): Promise<ListOfDevnet[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['urlList'], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result['urlList'] || []);
    });
  });
}

// Function to add a new devnet URL to URL list in Chrome sync storage
async function addUrlToUrlListInSyncStorage(item: ListOfDevnet): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  if (!urlList.some((devnet) => devnet.url === item.url)) {
    urlList.push(item);
    await saveUrlListToSyncStorage(urlList);
  }
}

// Function to remove devnet URL from URL list in Chrome sync storage
async function removeUrlFromListInSyncStorage(url: string): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  const newUrlList = urlList.filter((devnet) => devnet.url !== url);
  await saveUrlListToSyncStorage(newUrlList);
}

// Function to update devnet URL from URL list in Chrome sync storage
async function updateUrlFromListInSyncStorage(url: string, isAlive: boolean): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  const newUrlList = urlList.map((devnet) =>
    devnet.url === url ? { ...devnet, isAlive } : devnet
  );
  await saveUrlListToSyncStorage(newUrlList);
}

// Function to set selected account address
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

// Function to set block interval for  a given URL
async function setUrlBlockInterval(message: any, sendResponse: (response?: any) => void) {
  try {
    await addIntervalToBlockIntervalInSyncStorage(message.url, message.interval);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    await createMintBlockAlarm(message.url, message.interval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to remove block interval for a given URL
async function removeUrlBlockInterval(message: any, sendResponse: (response?: any) => void) {
  try {
    await removeIntervalFromBlockIntervalInSyncStorage(message.url);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to save block interval object to Chrome sync storage
async function saveBlockIntervalToSyncStorage(blockInterval: Map<string, number>): Promise<void> {
  const obj = Object.fromEntries(blockInterval);
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ blockInterval: obj }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// Function to get block interval object from Chrome sync storage
async function getBlockIntervalFromSyncStorage(): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['blockInterval'], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const obj = result['blockInterval'] || {};
      const blockInterval = new Map<string, number>(Object.entries(obj));

      resolve(blockInterval);
    });
  });
}

// Function to add a new block interval for a given URL in Chrome sync storage and start alarm for this interval
async function addIntervalToBlockIntervalInSyncStorage(
  url: string,
  interval: number
): Promise<void> {
  const blockInterval = await getBlockIntervalFromSyncStorage();
  blockInterval.set(url, interval);
  await saveBlockIntervalToSyncStorage(blockInterval);
}

// Function to remove block interval for a given URL in Chrome sync storage and stop alarm for this interval
async function removeIntervalFromBlockIntervalInSyncStorage(url: string): Promise<void> {
  try {
    const blockInterval = await getBlockIntervalFromSyncStorage();

    chrome.alarms.get(`mintBlockAlarm_${url}`, async (existingAlarm) => {
      if (existingAlarm) {
        chrome.alarms.clear(`mintBlockAlarm_${url}`, (cleared) => {
          if (cleared) {
            blockInterval.delete(url);
            saveBlockIntervalToSyncStorage(blockInterval)
              .then(() => {})
              .catch((error) => {
                console.error(`Failed to save updated block interval: ${error}`);
              });
          } else {
            console.error(`Failed to clear alarm for URL: ${url}`);
          }
        });
      } else {
        blockInterval.delete(url);
        saveBlockIntervalToSyncStorage(blockInterval)
          .then(() => {})
          .catch((error) => {
            console.error(`Failed to save updated block interval: ${error}`);
          });
      }
    });
  } catch (error) {
    console.error('Error removing interval from block interval:', error);
  }
}

// Function to sign a Rivet message
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
                  data: { error: 'Error executing transaction.' },
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

// Function to declare a Contract from Rivet extension
async function declareContract(message: any, sendResponse: (response?: any) => void) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const declareResponse = await acc.declareIfNot({
      contract: message.data.sierra,
      casm: message.data.casm,
    });
    if (declareResponse.transaction_hash != '') {
      await provider.waitForTransaction(declareResponse.transaction_hash);
    }
    sendResponse({ class_hash: declareResponse.class_hash });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to deploy a Contract from Rivet extension
async function deployContract(message: any, sendResponse: (response?: any) => void) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const { abi: testAbi } = await provider.getClassByHash(message.data.class_hash);
    const contractCallData: CallData = new CallData(testAbi);

    const ConstructorCallData: Calldata = contractCallData.compile(
      'constructor',
      message.data.call_data
    );

    const deployResponse = await acc.deployContract({
      classHash: message.data.class_hash,
      constructorCalldata: ConstructorCallData,
    });
    await provider.waitForTransaction(deployResponse.transaction_hash);

    sendResponse({ contract_address: deployResponse.contract_address });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Utils functions Parse error message
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
// Utils functions to get selected account from Chrome sync storage
async function getSelectedAccount(): Promise<Account> {
  const result = await chrome.storage.sync.get(['selectedAccount']);
  const selectedAccount = result.selectedAccount;
  const provider = await getProvider();

  return new Account(provider, selectedAccount.address, selectedAccount.private_key);
}

// Utils functions to get provider from Chrome sync storage
async function getProvider(): Promise<RpcProvider> {
  const resultUrl = await chrome.storage.sync.get(['url']);
  const url = resultUrl.url;

  return new RpcProvider({ nodeUrl: `http://${url}/rpc` });
}

// Function to create an alarm (or clear and creat new one) that will mint block at this interval
async function createMintBlockAlarm(url: string, interval: number): Promise<void> {
  try {
    const blockInterval = await getBlockIntervalFromSyncStorage();

    chrome.alarms.get(`mintBlockAlarm_${url}`, async (existingAlarm) => {
      if (existingAlarm) {
        // If an alarm exists, clear it
        chrome.alarms.clear(`mintBlockAlarm_${url}`, (cleared) => {
          if (cleared) {
            // Update block interval and set new alarm
            updateAndSetAlarm(url, interval, blockInterval);
          } else {
            console.error(`Failed to clear existing alarm for URL: ${url}`);
          }
        });
      } else {
        // If no existing alarm, directly set the new alarm
        updateAndSetAlarm(url, interval, blockInterval);
      }
    });
  } catch (error) {
    console.error('Error create Mint Block Alarm:', error);
  }
}

// Function that update the alarm to mint block for the new interval
function updateAndSetAlarm(
  url: string,
  interval: number,
  blockInterval: Map<string, number>
): void {
  blockInterval.set(url, interval);
  chrome.storage.local.set({ blockInterval: Object.fromEntries(blockInterval) }, () => {
    // Create a new alarm with the specified URL and interval
    const intervalMinutes = interval / (1000 * 60);
    chrome.alarms.create(`mintBlockAlarm_${url}`, { periodInMinutes: intervalMinutes });
  });
}

// Function that mint new block for the given devnet URL
async function mintBlock(url: string): Promise<void> {
  try {
    const response = await fetch(`http://${url}/create_block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      console.log(`Minted block for ${url}`);
    } else {
      console.error('Error creating block:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating block:', error);
  }
}
