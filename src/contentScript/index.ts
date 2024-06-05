import browser from "webextension-polyfill";

console.info('contentScript is running')

const container = document.head || document.documentElement
const script = document.createElement("script")
script.setAttribute("type", "module");  // Set the script type to module


script.src = chrome.runtime.getURL("inpage.js")
const starknetRivetExtensionId = chrome.runtime.id
script.id = "starknet-rivet-extension"
script.setAttribute("data-extension-id", starknetRivetExtensionId)

container.insertBefore(script, container.children[0])

window.addEventListener('message', async function(event) {
  if (event.origin !== window.location.origin) {
      console.warn('Message received from an unexpected origin:', event.origin);
      return;
  }

  if (event.data.extensionId && event.data.extensionId === 'iflmkgmjoppefaohpceojfikhkbcnopg') {
    if (event.data.type === 'CONNECT_RIVET_DAPP') {
      let res = await chrome.runtime.sendMessage({type: event.data.type});
      window.postMessage(res);
      return true; 
    }
    else if (event.data.type === 'EXECUTE_RIVET_TRANSACTION') {
      chrome.runtime.sendMessage({ type: "EXECUTE_RIVET_TRANSACTION", data: event.data.data }, (response) => {
      });
      return true; 
    } 
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_SELECTED_ACCOUNT') {    
    (async () => {
      try {
        let res = await chrome.runtime.sendMessage({ type: message.type });
        window.postMessage({ type: "CONNECT_RIVET_DAPP_RES", selectedAccount: message.selectedAccount }, "*");
        sendResponse(res); 
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error in handling message:", error.message);
          sendResponse({ success: false, error: error.message });
        } else {
          console.error("An unknown error occurred", error);
          sendResponse({ success: false, error: "An unknown error occurred" });
        }
      }
    })();
    return true;  
  }

  if (message.type === 'EXECUTE_RIVET_TRANSACTION_RES') {   
    (async () => {
      try {
        let res = await chrome.runtime.sendMessage({ type: message.type, data: message.data  });
        window.postMessage({ type: "EXECUTE_RIVET_TRANSACTION_RES", data: res }, "*");
        sendResponse(res);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error in handling message:", error.message);
          sendResponse({ success: false, error: error.message });
        } else {
          console.error("An unknown error occurred", error);
          sendResponse({ success: false, error: "An unknown error occurred" });
        }
      }
    })();
    return true;
  }
});