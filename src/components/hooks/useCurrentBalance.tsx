import { useFetchData } from './useFetchData';

const getBalance = async () => {
  const { currentBalance } = await chrome.storage.sync.get(['currentBalance']);
  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }
  return currentBalance;
};

const saveBalance = async (currentBalance: bigint) => {
  await chrome.storage.sync.set({ currentBalance });
  if (chrome.runtime.lastError) {
    throw new Error(chrome.runtime.lastError.message);
  }
  return currentBalance;
};

export const useCurrentBalance = () => {
  return useFetchData<bigint>(0n, getBalance, saveBalance);
};
