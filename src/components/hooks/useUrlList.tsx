import { getUrlList, saveUrlList } from '../../background/syncStorage';
import { UrlItem } from '../context/interfaces';
import { useFetchData } from './useFetchData';

export const useUrlList = () => {
  const updater = async (updatedList: UrlItem[]) => {
    const response = await saveUrlList(updatedList);
    return [...response];
  };

  return useFetchData<UrlItem[]>([], getUrlList, updater);
};
