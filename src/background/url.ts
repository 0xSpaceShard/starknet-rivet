import { UrlMessage } from './interface';
import { getUrlFromSyncStorage, setUrlFromSyncStorage } from './storage';
import { parseErrorMessage } from './utils';

// Function to set URL in Chrome storage
export async function setUrl(
  message: UrlMessage,
  sendResponse: (response?: { success: boolean; url?: string; error?: string }) => void
) {
  try {
    await setUrlFromSyncStorage(message.data.url);
    const url = await getUrlFromSyncStorage();
    sendResponse({ success: true, url: url });
  } catch (error) {
    sendResponse({ success: false, error: parseErrorMessage(error) });
  }
}

// Function to get URL from Chrome storage
export async function getUrl(
  sendResponse: (response?: { success: boolean; url?: string; error?: string }) => void
) {
  try {
    const url = await getUrlFromSyncStorage();
    sendResponse({ success: true, url: url });
  } catch (error) {
    sendResponse({ success: false, error: parseErrorMessage(error) });
  }
}
