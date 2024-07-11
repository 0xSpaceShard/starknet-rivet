import { UrlMessage } from './interface';
import { getUrlFromSyncStorage, setUrlFromSyncStorage } from './storage';
import { parseErrorMessage } from './utils';

// Function to set URL in Chrome storage
export async function setUrl(message: UrlMessage, sendResponse: (response?: any) => void) {
  try {
    await setUrlFromSyncStorage(message.data.url);
    const url = await getUrlFromSyncStorage();
    sendResponse({ success: true, url: url });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to get URL from Chrome storage
export async function getUrl(sendResponse: (response?: any) => void) {
  try {
    const url = await getUrlFromSyncStorage();
    sendResponse({ success: true, url: url });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}
