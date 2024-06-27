import { Account, RpcProvider } from 'starknet-6';

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
  const selectedAccount = result.selectedAccount;
  const provider = await getProvider();

  return new Account(provider, selectedAccount.address, selectedAccount.private_key);
}

// Utils functions to get provider from Chrome sync storage
export async function getProvider(): Promise<RpcProvider> {
  const resultUrl = await chrome.storage.sync.get(['url']);
  const url = resultUrl.url;

  return new RpcProvider({ nodeUrl: `http://${url}/rpc` });
}
