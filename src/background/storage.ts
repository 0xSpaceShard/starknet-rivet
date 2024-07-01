import { ListOfDevnet } from './interface';

// Function to save a new URL to the list of devnet networks in Chrome storage
export async function saveUrlListToSyncStorage(urlList: ListOfDevnet[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ ['urlList']: urlList }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// Function to retrieve devnet URL list from Chrome sync storage
export async function getUrlListFromSyncStorage(): Promise<ListOfDevnet[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['urlList'], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result['urlList'] || []);
    });
  });
}

// Function to add a new devnet URL to URL list in Chrome sync storage
export async function addUrlToUrlListInSyncStorage(item: ListOfDevnet): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  if (!urlList.some((devnet) => devnet.url === item.url)) {
    urlList.push(item);
    await saveUrlListToSyncStorage(urlList);
  }
}

// Function to remove devnet URL from URL list in Chrome sync storage
export async function removeUrlFromListInSyncStorage(url: string): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  const newUrlList = urlList.filter((devnet) => devnet.url !== url);
  await saveUrlListToSyncStorage(newUrlList);
}

// Function to update devnet URL from URL list in Chrome sync storage
export async function updateUrlFromListInSyncStorage(url: string, isAlive: boolean): Promise<void> {
  const urlList = await getUrlListFromSyncStorage();
  const newUrlList = urlList.map((devnet) =>
    devnet.url === url ? { ...devnet, isAlive } : devnet
  );
  await saveUrlListToSyncStorage(newUrlList);
}

// Function to save block interval object to Chrome sync storage
export async function saveBlockIntervalToSyncStorage(
  blockInterval: Map<string, number>
): Promise<void> {
  const obj = Object.fromEntries(blockInterval);
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({ blockInterval: obj }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

// Function to get block interval object from Chrome sync storage
export async function getBlockIntervalFromSyncStorage(): Promise<Map<string, number>> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['blockInterval'], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      const obj = result['blockInterval'] || {};
      const blockInterval = new Map<string, number>(Object.entries(obj));
      resolve(blockInterval);
    });
  });
}

// Function to add a new block interval for a given URL in Chrome sync storage and start alarm for this interval
export async function addIntervalToBlockIntervalInSyncStorage(
  url: string,
  interval: number
): Promise<void> {
  const blockInterval = await getBlockIntervalFromSyncStorage();
  blockInterval.set(url, interval);
  await saveBlockIntervalToSyncStorage(blockInterval);
}

// Function to remove block interval for a given URL in Chrome sync storage and stop alarm for this interval
export async function removeIntervalFromBlockIntervalInSyncStorage(url: string): Promise<void> {
  try {
    const blockInterval = await getBlockIntervalFromSyncStorage();
    await new Promise<void>((resolve, reject) => {
      chrome.alarms.get(`mintBlockAlarm_${url}`, async (existingAlarm) => {
        if (existingAlarm) {
          chrome.alarms.clear(`mintBlockAlarm_${url}`, async (cleared) => {
            if (cleared) {
              blockInterval.delete(url);
              await saveBlockIntervalToSyncStorage(blockInterval)
                .then(resolve)
                .catch((error) => {
                  reject(error);
                  console.error(`Failed to save updated block interval: ${error}`);
                });
            } else {
              reject(`Failed to clear alarm for URL: ${url}`);
              console.error(`Failed to clear alarm for URL: ${url}`);
            }
          });
        } else {
          blockInterval.delete(url);
          await saveBlockIntervalToSyncStorage(blockInterval)
            .then(resolve)
            .catch((error) => {
              reject(error);
              console.error(`Failed to save updated block interval: ${error}`);
            });
        }
      });
    });
  } catch (error) {
    console.error('Error removing interval from block interval:', error);
    throw error;
  }
}
