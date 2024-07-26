import {
  ListOfDevnet,
  NewUrlToListtMessage,
  ResponseMessage,
  UrlListMessage,
  UrlMessage,
} from './interface';
import {
  addUrlToUrlListInSyncStorage,
  getUrlListFromSyncStorage,
  removeUrlFromListInSyncStorage,
  updateUrlFromListInSyncStorage,
} from './syncStorage';

// Function to set a new devnet URL to URL list
export async function setNewUrlToList(
  message: NewUrlToListtMessage,
  sendResponse: (response?: ResponseMessage) => void
) {
  try {
    await addUrlToUrlListInSyncStorage(message.data.item);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to set a new devnet URL to URL list
export async function removeUrlFromList(
  message: UrlMessage,
  sendResponse: (response?: ResponseMessage) => void
) {
  try {
    await removeUrlFromListInSyncStorage(message.data.url);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to update devnet URL from URL list
export async function updateUrlFromList(
  message: UrlListMessage,
  sendResponse: (response?: ResponseMessage) => void
) {
  try {
    await updateUrlFromListInSyncStorage(message.data.url, message.data.isAlive);
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to get devnet URL list
export async function getUrlList(sendResponse: (response?: ResponseMessage) => void) {
  try {
    const updatedUrlList = await getUrlListFromSyncStorage();
    sendResponse({ success: true, urlList: updatedUrlList });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}
