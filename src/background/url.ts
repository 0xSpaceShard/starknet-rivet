import { parseErrorMessage } from './utils';

// Function to set URL in Chrome storage
export async function setUrl(message: any, sendResponse: (response?: any) => void) {
  try {
    await chrome.storage.sync.set({ url: message.url });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}
