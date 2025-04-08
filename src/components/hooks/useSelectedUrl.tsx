import { useEffect } from 'react';
import { initUrlConfig } from '../../background/utils';
import { getSelectedUrl, saveSelectedUrl } from '../../background/syncStorage';
import { useFetchData } from './useFetchData';

export const useSelectedUrl = () => {
  const updater = async (selectedUrl: string) => {
    const response = await saveSelectedUrl(selectedUrl);
    await initUrlConfig(selectedUrl);
    return response;
  };

  const init = async () => {
    const selectedUrl = await getSelectedUrl();
    await initUrlConfig(selectedUrl);
  };

  useEffect(() => {
    init();
  }, []);

  return useFetchData<string>('', getSelectedUrl, updater);
};
