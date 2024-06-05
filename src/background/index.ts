import { Account, RpcProvider } from "starknet";

console.log('background is running');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);

  switch (message.type) {
    case 'CONNECT_RIVET_DAPP':
      chrome.storage.sync.get(['selectedAccount'], (result) => {
        const selectedAccount = result.selectedAccount || '';
        if (selectedAccount === '') {
          chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
          });
        }
        sendResponse({
          type: "CONNECT_RIVET_DAPP_RES",
          data: { data: selectedAccount }
        });
      });
      return true;

    case 'EXECUTE_RIVET_TRANSACTION':
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 400,
        height: 600
      }, (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            chrome.runtime.onMessage.hasListener(function onResponseListener(responseMessage) {
              if (responseMessage.type === 'EXECUTE_RIVET_TRANSACTION_RES') {
                if (sender.tab && sender.tab.id !== undefined) {
                  chrome.tabs.sendMessage(sender.tab.id, responseMessage);
                }
                chrome.runtime.onMessage.removeListener(onResponseListener);
              }
            });
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: "EXECUTE_RIVET_TRANSACTION", data: message.data });
            }, 1000);
          }
        }
      });
      return true;

      case 'EXECUTE_RIVET_TRANSACTION_RES':  
        (async () => {
          try {
            const result = await chrome.storage.sync.get(['selectedAccount']);
            const selectedAccount = result.selectedAccount;
  
            if (selectedAccount) {
              const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:8081/rpc' });
              const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);
             
              const tx = await acc.execute(message.data.transactions);
              const res = await provider.waitForTransaction(tx.transaction_hash)
              sendResponse({
                type: "EXECUTE_RIVET_TRANSACTION_RES",
                data: tx
              });
            } else {
              console.error('No selected account found in storage.');
              sendResponse({ error: 'No selected account found in storage.' });
            }
          } catch (error) {
            console.error('Error executing transaction:', error);
            sendResponse({ error: 'Error executing transaction.' });
          }
        })();
  
        return true;

    case 'SET_SELECTED_ACCOUNT':
      chrome.storage.sync.set({ selectedAccount: message.selectedAccount }, () => {
        chrome.tabs.query({}, function (tabs) {
          for (let i = 0; i < tabs.length; i++) {
            chrome.tabs.sendMessage(tabs[i].id as number, { type: 'UPDATE_SELECTED_ACCOUNT', data: { data: message.selectedAccount } });
          }
        });
        sendResponse({ success: true });
      });
      return true;


    default:
      sendResponse({ error: 'Unknown message type.' });
      return true;
  }
});

