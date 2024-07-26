import { getSelectedAccount, saveSelectedAccount } from '../../background/syncStorage';
import { AccountData } from '../context/interfaces';
import { sendAccountUpdatedMessage } from '../utils/sendMessageBackground';
import { useFetchData } from './useFetchData';

export const useSelectedAccount = () => {
  const updater = async (selectedAccount: AccountData | null) => {
    const response = await saveSelectedAccount(selectedAccount);
    await sendAccountUpdatedMessage(response);
    return response;
  };

  return useFetchData<AccountData | null>(null, getSelectedAccount, updater);
};
