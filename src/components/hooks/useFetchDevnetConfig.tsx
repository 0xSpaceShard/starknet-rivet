import { fetchDevnetConfig } from '../../background/utils';
import { DevnetConfig } from '../../background/interface';
import { saveDevnetConfig } from '../../background/syncStorage';
import { useFetchData } from './useFetchData';

export const useFetchDevnetConfig = () => {
  const updater = async (devnetConfig: DevnetConfig | null) => {
    const response = await saveDevnetConfig(devnetConfig);
    return response;
  };

  return useFetchData<DevnetConfig | null>(null, fetchDevnetConfig, updater);
};
