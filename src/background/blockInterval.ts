import { createMintBlockAlarm } from './alarms';
import {
  addIntervalToBlockIntervalInSyncStorage,
  getBlockIntervalFromSyncStorage,
  removeIntervalFromBlockIntervalInSyncStorage,
} from './storage';

// Function to set block interval for  a given URL
export async function setUrlBlockInterval(message: any, sendResponse: (response?: any) => void) {
  try {
    await addIntervalToBlockIntervalInSyncStorage(message.url, message.interval);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    await createMintBlockAlarm(message.url, message.interval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}

// Function to remove block interval for a given URL
export async function removeUrlBlockInterval(message: any, sendResponse: (response?: any) => void) {
  try {
    await removeIntervalFromBlockIntervalInSyncStorage(message.url);
    const updatedBlockInterval = await getBlockIntervalFromSyncStorage();
    const blockIntervalObject = Object.fromEntries(updatedBlockInterval);
    sendResponse({ success: true, blockInterval: blockIntervalObject });
  } catch (error) {
    sendResponse({ success: false });
  }
  return true;
}
