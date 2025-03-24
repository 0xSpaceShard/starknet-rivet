import { useFetchData } from './useFetchData';
import { getL1NodePort, saveL1NodePort } from '../../background/syncStorage';

export const useL1Node = () => {
  const updater = async (l1NodePort: string) => {
    await saveL1NodePort(l1NodePort);
  };

  const fetcher = async () => {
    const data = await getL1NodePort();
    return data;
  };

  return useFetchData<any>([], fetcher, updater);
};
