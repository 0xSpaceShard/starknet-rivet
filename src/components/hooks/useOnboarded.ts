import { useFetchData } from './useFetchData';
import { getOnboarded, saveOnboarded } from '../../background/syncStorage';

export const useOnboarded = () => {
  const updater = async (onboarded: boolean) => {
    await saveOnboarded(onboarded);
  };

  const fetcher = async () => {
    const data = await getOnboarded();
    return data;
  };

  return useFetchData<any>({}, fetcher, updater);
};
