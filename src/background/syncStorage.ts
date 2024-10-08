import { AccountData } from '../components/context/interfaces';
import { DEFAULT_DEVNET_URL } from './constants';
import { DevnetInfo } from './interface';

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
      return resolve();
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
      const obj = result.blockInterval || {};
      const blockInterval = new Map<string, number>(Object.entries(obj));
      return resolve(blockInterval);
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
              console.error(`Failed to clear alarm for URL: ${url}`);
              reject(new Error(`Failed to clear alarm for URL: ${url}`));
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

export async function getSelectedAccount(): Promise<AccountData | null> {
  const { selectedAccount } = await chrome.storage.sync.get(['selectedAccount']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return selectedAccount ?? null;
}

export async function saveSelectedAccount(
  selectedAccount: AccountData | null
): Promise<AccountData | null> {
  await chrome.storage.sync.set({ selectedAccount });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return selectedAccount;
}

export async function getSelectedUrl(): Promise<string> {
  const { selectedUrl } = await chrome.storage.sync.get(['selectedUrl']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return selectedUrl ?? DEFAULT_DEVNET_URL;
}

export async function saveSelectedUrl(selectedUrl: string): Promise<string> {
  await chrome.storage.sync.set({ selectedUrl });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return selectedUrl;
}

export async function getUrlList(): Promise<DevnetInfo[]> {
  const { urlList } = await chrome.storage.sync.get(['urlList']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return urlList ?? [{ url: DEFAULT_DEVNET_URL, isAlive: true }];
}

export async function saveUrlList(urlList: DevnetInfo[]): Promise<DevnetInfo[]> {
  await chrome.storage.sync.set({ urlList });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return urlList;
}

export async function getAccountContracts(): Promise<Record<string, string[]>> {
  const { accountContracts } = await chrome.storage.sync.get(['accountContracts']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return accountContracts ?? {};
}

export async function saveAccountContracts(
  accountContracts: Record<string, string[]>
): Promise<Record<string, string[]>> {
  await chrome.storage.sync.set({ accountContracts });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return accountContracts;
}

export enum AccountType {
  OpenZeppelin,
  Argent,
  Braavos,
  Ethereum,
}

export interface CustomAccount extends AccountData {
  type: AccountType;
}

export async function getCustomAccounts(): Promise<CustomAccount[]> {
  const { customAccounts } = await chrome.storage.sync.get(['customAccounts']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return customAccounts ?? [];
}

export async function saveCustomAccounts(
  customAccounts: CustomAccount[]
): Promise<CustomAccount[]> {
  await chrome.storage.sync.set({ customAccounts });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return customAccounts;
}

export async function addCustomAccount(customAccount: CustomAccount): Promise<boolean> {
  const customAccounts = await getCustomAccounts();
  await saveCustomAccounts([...customAccounts, customAccount]);
  return true;
}

export async function removeCustomAccount(accountAddress: string): Promise<boolean> {
  const customAccounts = await getCustomAccounts();
  customAccounts.filter((acc) => acc.address !== accountAddress);
  await saveCustomAccounts(customAccounts);
  return true;
}
