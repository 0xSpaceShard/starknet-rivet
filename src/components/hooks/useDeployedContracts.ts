import { getDeployedContracts, saveDeployedContract } from '../../background/syncStorage';
import { Contract } from '../../background/interface';
import { useFetchData } from './useFetchData';

export const useDeployedContracts = () => {
  const updater = async (contract: Contract) => {
    await saveDeployedContract(contract);
  };

  return useFetchData<any>(null, getDeployedContracts, updater);
};
