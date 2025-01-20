import { getDeployedContracts, saveDeployedContracts } from '../../background/syncStorage';
import { Contract } from '../../background/interface';
import { useFetchData } from './useFetchData';

export const useDeployedContracts = () => {
  const updater = async (contract: Contract) => {
    await saveDeployedContracts(contract);
  };

  const fetcher = async () => {
    const data = await getDeployedContracts();
    return data;
  };

  return useFetchData<any>([], fetcher, updater);
};
