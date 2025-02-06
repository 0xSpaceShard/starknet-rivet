import { AccountData, UrlConfig } from '../components/context/interfaces';
import { DEFAULT_DEVNET_URL } from './constants';
import { Contract, DevnetInfo } from './interface';

export async function getUrlContextData<T>(key: string, defaultValue: T): Promise<T> {
  const selectedUrl = await getSelectedUrl();
  const dataSet = (await chrome.storage.sync.get([key])) ?? {};
  const storedData = (dataSet[key] ?? {}) as Record<string, T>;

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return storedData[selectedUrl] ?? defaultValue;
}

export async function saveUrlContextData<T>(key: string, data: T): Promise<T> {
  const selectedUrl = await getSelectedUrl();
  const dataSet = (await chrome.storage.sync.get([key])) ?? {};
  const storedData = (dataSet[key] ?? {}) as Record<string, T>;

  storedData[selectedUrl] = data;
  await chrome.storage.sync.set({ [key]: storedData });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return data;
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
                  console.debug(`Failed to save updated block interval: ${error}`);
                });
            } else {
              console.debug(`Failed to clear alarm for URL: ${url}`);
              reject(new Error(`Failed to clear alarm for URL: ${url}`));
            }
          });
        } else {
          blockInterval.delete(url);
          await saveBlockIntervalToSyncStorage(blockInterval)
            .then(resolve)
            .catch((error) => {
              reject(error);
              console.debug(`Failed to save updated block interval: ${error}`);
            });
        }
      });
    });
  } catch (error) {
    console.debug('Error removing interval from block interval:', error);
    throw error;
  }
}

export async function getUrlConfig(): Promise<UrlConfig | null> {
  const { urlConfig } = await chrome.storage.sync.get(['urlConfig']);

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return urlConfig ?? null;
}

export async function saveUrlConfig(urlConfig: UrlConfig | null): Promise<UrlConfig | null> {
  await chrome.storage.sync.set({ urlConfig });

  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }

  return urlConfig;
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
  return getUrlContextData<Record<string, string[]>>('accountContracts', {});
}

export async function saveAccountContracts(
  accountContracts: Record<string, string[]>
): Promise<Record<string, string[]>> {
  return saveUrlContextData('accountContracts', accountContracts);
}

export enum AccountType {
  Predeployed,
  OpenZeppelin,
  Argent,
  Braavos,
  Ethereum,
}

export interface CustomAccount extends AccountData {
  type: AccountType;
}

export async function getCustomAccounts(): Promise<CustomAccount[]> {
  return getUrlContextData<CustomAccount[]>('customAccounts', []);
}

export async function saveCustomAccounts(
  customAccounts: CustomAccount[]
): Promise<CustomAccount[]> {
  return saveUrlContextData('customAccounts', customAccounts);
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

export async function getDeployedContracts(): Promise<Contract[]> {
  return getUrlContextData<Contract[]>('deployedContracts', []);
}

export async function saveDeployedContracts(deployedContract: Contract): Promise<Contract[]> {
  const deployedContracts = await getDeployedContracts();
  return saveUrlContextData('deployedContracts', [...deployedContracts, deployedContract]);
}
