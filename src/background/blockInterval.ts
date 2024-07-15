import { createMintBlockAlarm } from './alarms';
import { BlockIntervalMessage, UrlMessage } from './interface';
import {
  addIntervalToBlockIntervalInSyncStorage,
  getBlockIntervalFromSyncStorage,
  removeIntervalFromBlockIntervalInSyncStorage,
} from './storage';

// Function to set block interval for  a given URL
export async function setUrlBlockInterval(
  message: BlockIntervalMessage,
  sendResponse: (response?: any) => void
) {
  try {
    await addIntervalToBlockIntervalInSyncStorage(message.data.url, message.data.interval);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    await createMintBlockAlarm(message.data.url, message.data.interval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to remove block interval for a given URL
export async function removeUrlBlockInterval(
  message: UrlMessage,
  sendResponse: (response?: any) => void
) {
  try {
    await removeIntervalFromBlockIntervalInSyncStorage(message.data.url);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}
