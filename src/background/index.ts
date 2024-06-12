import { Account, RpcProvider, stark } from "starknet-6";

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
            const onResponseListener = (responseMessage: any) => {
              if (responseMessage.type === 'EXECUTE_RIVET_TRANSACTION_RES') {
                (async () => {
                  try {
                    const result = await chrome.storage.sync.get(['selectedAccount']);
                    const selectedAccount = result.selectedAccount;
          
                    if (selectedAccount) {
                      const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:8081/rpc' });
                      const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);
                     
                      const tx = await acc.execute(message.data.transactions);
                      const res = await provider.waitForTransaction(tx.transaction_hash)
        
                      sendResponse({ type: "EXECUTE_RIVET_TRANSACTION_RES", data: tx});
                    } 
                    else {
                      console.error('No selected account found in storage.');
                      sendResponse({ error: 'No selected account found in storage.' });
                    }
                  }
                  catch (error) {
                    console.log("HERE BACK FAILED AFTER EXEC: ", error)
                    sendResponse({  type: "RIVET_TRANSACTION_FAILED", data: {error: 'Error executing transaction.'}});
                  }
                })();
              }
              if (responseMessage.type === 'RIVET_TRANSACTION_FAILED') {
                console.log("BACKGROUND FAILL USER ABORT")
                sendResponse({  type: "RIVET_TRANSACTION_FAILED", data: {error: 'User abort'}});
              }
            };
            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: "EXECUTE_RIVET_TRANSACTION", data: message.data });
            }, 1000);
          }
        }
      });
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
    
    case 'SIGN_RIVET_MESSAGE':
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 400,
        height: 600
      }, (window) => {
        if (window && window.tabs && window.tabs[0]) {
          const tabId = window.tabs[0].id;
          if (tabId) {
            const onResponseListener = (responseMessage: any) => {
              if (responseMessage.type === 'SIGN_RIVET_MESSAGE_RES') {
                (async () => {
                  try {
                    const result = await chrome.storage.sync.get(['selectedAccount']);
                    const selectedAccount = result.selectedAccount;

                    if (selectedAccount) {
                      const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:8081/rpc' });
                      const acc = new Account(provider, selectedAccount.address, selectedAccount.private_key);

                      const signature = await acc.signMessage(responseMessage.data.typedData);
                      const formattedSignature = stark.signatureToDecimalArray(signature)

                      sendResponse({ type: "SIGN_RIVET_MESSAGE_RES", data: formattedSignature});
                    } 
                    else {
                      console.error('No selected account found in storage.');
                      sendResponse({ type: "SIGNATURE_RIVET_FAILURE", error: 'No selected account found in storage.' });
                    }
                  }
                  catch (error) {
                    sendResponse({  type: "SIGNATURE_RIVET_FAILURE", data: {error: 'Error executing transaction.'}});
                  }
                })();
              }
              if (responseMessage.type === 'SIGNATURE_RIVET_FAILURE') {
                sendResponse({  type: "SIGNATURE_RIVET_FAILURE", data: {error: 'User abort'}});
              }
            };
            chrome.runtime.onMessage.addListener(onResponseListener);
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, { type: "SIGN_RIVET_MESSAGE", data: message.data });
            }, 1000);
          }
        }
      });
      return true;


    default:
      sendResponse({ error: 'Unknown message type.' });
      return true;
  }
});

