import { AccountData, ListOfDevnet } from '../context/interfaces';

export function sendMessageToSetSelectedAccount(
  selectedAccount: AccountData | null,
  setSelectedAccount: React.Dispatch<React.SetStateAction<AccountData | null>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'SET_SELECTED_ACCOUNT',
      data: {
        selectedAccount: selectedAccount,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to set selectedAccount');
      } else {
        setSelectedAccount(response.selectedAccount);
      }
    }
  );
}

export function sendMessageToSetUrl(
  url: string,
  setUrl: React.Dispatch<React.SetStateAction<string>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'SET_URL',
      data: {
        url: url,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to fetch url ');
      } else {
        setUrl(response.url);
      }
    }
  );
}

export function sendMessageToGetUrl(setUrl: React.Dispatch<React.SetStateAction<string>>) {
  chrome.runtime.sendMessage(
    {
      type: 'GET_URL',
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to fetch url ');
      } else {
        setUrl(response.url);
      }
    }
  );
}

export function sendMessageToUpdateUrlList(
  url: string,
  isAlive: boolean,
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_URL_FROM_LIST',
      data: {
        url,
        isAlive,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to update url list');
      } else {
        setUrlList(response.urlList);
      }
    }
  );
}

export function sendMessageToSetUrlList(
  item: ListOfDevnet,
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'SET_NEW_URL_TO_LIST',
      data: {
        item,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to set new url into list');
      } else {
        setUrlList(response.urlList);
      }
    }
  );
}

export function sendMessageToRemoveUrlFromList(
  url: string,
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'REMOVE_URL_FROM_LIST',
      data: {
        url,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to remove url from list');
      } else {
        setUrlList(response.urlList);
      }
    }
  );
}

export function sendMessageToGetUrlList(
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'GET_URL_LIST',
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to get url list');
      } else {
        setUrlList(response.urlList);
      }
    }
  );
}

export function sendMessageToSetBlockInterval(
  url: string,
  interval: number,
  setBlockInterval: React.Dispatch<React.SetStateAction<Map<string, number>>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'SET_URL_BLOCK_INTERVAL',
      data: {
        url,
        interval,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to set new block inteval');
      } else {
        const newBlockInterval = setBlockIntervalFromObject(response.blockInterval);
        setBlockInterval(newBlockInterval);
      }
    }
  );
}

export function sendMessageToRemoveBlockInterval(
  url: string,
  setBlockInterval: React.Dispatch<React.SetStateAction<Map<string, number>>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'REMOVE_URL_BLOCK_INTERVAL',
      data: {
        url,
      }
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to remove block interval');
      } else {
        const newBlockInterval = setBlockIntervalFromObject(response.blockInterval);
        setBlockInterval(newBlockInterval);
      }
    }
  );
}

export function sendMessageToUpdateAccountContracts(
  accountContracts: Map<string, string[]>,
  setAccountContracts: React.Dispatch<React.SetStateAction<Map<string, string[]>>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_ACCOUNT_CONTRACTS',
      accountContracts: Object.fromEntries(accountContracts),
    },
    ({ success, accountContracts: updatedContracts }) => {
      if (!success) {
        console.error('Failed to update account contracts');
      }
      const map = new Map<string, string[]>(Object.entries(updatedContracts));
      setAccountContracts(map);
    }
  );
}

function setBlockIntervalFromObject(obj: Record<string, number>): Map<string, number> {
  return new Map(Object.entries(obj));
}
