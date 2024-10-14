import { initUrlConfig } from '../../background/utils';
import { getSelectedUrl, saveSelectedUrl } from '../../background/syncStorage';
import { useFetchData } from './useFetchData';

export const useSelectedUrl = () => {
  const updater = async (selectedUrl: string) => {
    const response = await saveSelectedUrl(selectedUrl);
    await initUrlConfig(selectedUrl);
    return response;
  };

  return useFetchData<string>('', getSelectedUrl, updater);
};
