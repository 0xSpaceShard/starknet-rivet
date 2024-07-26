import { getSelectedUrl, saveSelectedUrl } from '../../background/syncStorage';
import { useFetchData } from './useFetchData';

export const useSelectedUrl = () => {
  return useFetchData<string>('', getSelectedUrl, saveSelectedUrl);
};
