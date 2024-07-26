import { getAccountContracts, saveAccountContracts } from '../../background/syncStorage';
import { useFetchData } from './useFetchData';

export const useAccountContracts = () => {
  const defaultValue = new Map<string, string[]>();
  const fetcher = async () => {
    const data = await getAccountContracts();
    return new Map(Object.entries(data));
  };
  const updater = async (updatedData: typeof defaultValue) => {
    await saveAccountContracts(Object.fromEntries(updatedData));
    return new Map(updatedData);
  };

  return useFetchData(defaultValue, fetcher, updater);
};
