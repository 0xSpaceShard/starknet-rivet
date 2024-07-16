console.info('contentScript is running');

const container = document.head || document.documentElement;
const script = document.createElement('script');
script.setAttribute('type', 'module'); // Set the script type to module

script.src = chrome.runtime.getURL('inpage.js');
const starknetRivetExtensionId = chrome.runtime.id;
script.id = 'starknet-rivet-extension';
script.setAttribute('data-extension-id', starknetRivetExtensionId);

container.insertBefore(script, container.children[0]);

let extensionId: string | null = null;

async function getExtensionId(): Promise<string> {
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
    console.error('Error getting extension ID:', error);
  });

interface ExtensionMessage {
  type: string;
  data?: any;
  error?: any;
  gas_fee?: any;
  extensionId?: string;
}

// Event listener for messages
window.addEventListener('message', async function (event: MessageEvent) {
  if (event.origin !== window.location.origin) {
    return;
  }

  const eventData: ExtensionMessage = event.data;

  if (eventData.extensionId && eventData.extensionId === extensionId) {
    let res: any;
    try {
      switch (eventData.type) {
        case 'CONNECT_RIVET_DAPP':
          res = await chrome.runtime.sendMessage({ type: eventData.type });
          break;
        case 'EXECUTE_RIVET_TRANSACTION':
          res = await chrome.runtime.sendMessage({
            type: 'EXECUTE_RIVET_TRANSACTION',
            data: eventData.data,
            gas_fee: eventData.gas_fee,
            error: eventData.error,
          });
          break;
        case 'SIGN_RIVET_MESSAGE':
          res = await chrome.runtime.sendMessage({
            type: 'SIGN_RIVET_MESSAGE',
            data: eventData.data,
          });
          break;
        case 'SIMULATE_RIVET_TRANSACTION':
          res = await chrome.runtime.sendMessage({
            type: 'SIMULATE_RIVET_TRANSACTION',
            data: eventData.data,
          });
          break;
        default:
          console.warn('Unhandled message type:', eventData.type);
          return;
      }
      window.postMessage({ ...res, type: res.type }, window.location.origin);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
});

// Listener for messages from the background script
chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  const handleResponse = async () => {
    try {
      switch (message.type) {
        case 'UPDATE_SELECTED_ACCOUNT':
          if (message.data == null) {
            window.postMessage({ type: 'DISCONNECT_RIVET_ACCOUNT', data: message.data }, '*');
          } else {
            window.postMessage({ type: 'CONNECT_RIVET_ACCOUNT_RES', data: message.data }, '*');
          }
          break;
        case 'EXECUTE_RIVET_TRANSACTION_RES':
        case 'SIMULATE_RIVET_TRANSACTION_RES':
        case 'SIGN_RIVET_MESSAGE_RES':
        case 'RIVET_TRANSACTION_FAILED' || 'SIGNATURE_RIVET_FAILURE':
          const res = await chrome.runtime.sendMessage({ type: message.type, data: message.data });
          window.postMessage({ type: message.type, data: res }, '*');
          sendResponse(res);
          break;
        default:
          console.warn('Unhandled message type:', message.type);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error in handling message:', error.message);
        sendResponse({ success: false, error: error.message });
      } else {
        console.error('An unknown error occurred', error);
        sendResponse({ success: false, error: 'An unknown error occurred' });
      }
    }
  };
  handleResponse();
  return true;
});
