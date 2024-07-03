import {
  addUrlToUrlListInSyncStorage,
  getUrlListFromSyncStorage,
  removeUrlFromListInSyncStorage,
  updateUrlFromListInSyncStorage,
} from './storage';

// Function to set a new devnet URL to URL list
export async function setNewUrlToList(message: any, sendResponse: (response?: any) => void) {
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
export async function removeUrlFromList(message: any, sendResponse: (response?: any) => void) {
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
export async function updateUrlFromList(message: any, sendResponse: (response?: any) => void) {
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
export async function getUrlList(sendResponse: (response?: any) => void) {
  try {
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}
