import { messages } from "@extend-chrome/messages";
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

let extensionId: string | null = null;

// Function to get the extension ID
function getExtensionId() {
  return new Promise<string>((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'GET_EXTENSION_ID' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response.extensionId);
      }
    });
  });
}

// Call the function to retrieve and store the extension ID
getExtensionId()
  .then((id) => {
    extensionId = id;
  })
  .catch((error) => {
    console.error("Error getting extension ID:", error);
  });

// Event listener for messages
window.addEventListener('message', async function(event) {
  if (event.origin !== window.location.origin) {
    console.warn('Message received from an unexpected origin:', event.origin);
    return;
  }

  if (event.data.extensionId && event.data.extensionId === extensionId) {
    if (event.data.type === 'CONNECT_RIVET_DAPP') {
      try {
        let res = await chrome.runtime.sendMessage({ type: event.data.type });
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          return;
        }
        window.postMessage(res, window.location.origin);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    } else if (event.data.type === 'EXECUTE_RIVET_TRANSACTION') {
      let res = await chrome.runtime.sendMessage({ type: "EXECUTE_RIVET_TRANSACTION", data: event.data.data, error: event.data?.error });
      window.postMessage({ ...res, type: res.type }, window.location.origin);
    } else if (event.data.type === 'SIGN_RIVET_MESSAGE') {
      let res = await chrome.runtime.sendMessage({ type: "SIGN_RIVET_MESSAGE", data: event.data.data });
      window.postMessage({ ...res, type: res.type }, window.location.origin);
    } else if (event.data.type === 'SIMULATE_RIVET_TRANSACTION') {
      let res = await chrome.runtime.sendMessage({ type: "SIMULATE_RIVET_TRANSACTION", data: event.data.data });
      window.postMessage({ ...res, type: res.type }, window.location.origin);
    }
  }
  return true;
});

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_SELECTED_ACCOUNT') {    
    (async () => {
      try {
        if (message.data.data == null) {
          window.postMessage({ type: "DISCONNECT_RIVET_ACCOUNT", data: message.data }, "*");
        } else {
          window.postMessage({ type: "CONNECT_RIVET_ACCOUNT_RES", data: message.data }, "*");
        }
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
        let res = await chrome.runtime.sendMessage({ type: message.type, data: message.data });
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

  if (message.type === 'SIMULATE_RIVET_TRANSACTION_RES') {   
    (async () => {
      try {
        let res = await chrome.runtime.sendMessage({ type: message.type, data: message.data });
        window.postMessage({ type: "SIMULATE_RIVET_TRANSACTION_RES", data: res }, "*");
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


  if (message.type === 'SIGN_RIVET_MESSAGE_RES') {   
    (async () => {
      try {
        let res = await chrome.runtime.sendMessage({ type: message.type, data: message.data });
        window.postMessage({ type: "SIGN_RIVET_MESSAGE_RES", data: res }, "*");
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

  if (message.type === 'RIVET_TRANSACTION_FAILED') {   
    (async () => {
      try {
        let res = await chrome.runtime.sendMessage({ type: message.type, data: message.error });
        window.postMessage({ type: "RIVET_TRANSACTION_FAILED", error: res }, "*");
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