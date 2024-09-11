import { Account, RpcProvider } from 'starknet-6';
import { getSelectedUrl } from './syncStorage';
import { DeclareContractMessage } from './interface';

// Utils functions Parse error message
export function parseErrorMessage(error: any): string {
  try {
    const errorObject = JSON.parse(error.message);
    if (errorObject.revert_error) {
      return errorObject.revert_error;
    }
    return error.message;
  } catch (e) {
    return error.message;
  }
}
// Utils functions to get selected account from Chrome sync storage
export async function getSelectedAccount(): Promise<Account> {
  const result = await chrome.storage.sync.get(['selectedAccount']);
  const { selectedAccount } = result;
  const provider = await getProvider();

  return new Account(provider, selectedAccount.address, selectedAccount.private_key);
}

// Utils functions to get provider from Chrome sync storage
export async function getProvider(): Promise<RpcProvider> {
  const url = await getSelectedUrl();
  return new RpcProvider({ nodeUrl: `${url}/rpc` });
}

// Utils functions to check the type of the message.
export function isDeclareContractMessage(message: any): message is DeclareContractMessage {
  return (message as DeclareContractMessage).data.sierra !== undefined;
}
