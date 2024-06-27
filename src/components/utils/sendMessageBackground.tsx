import { ListOfDevnet } from '../context/interfaces';

export function sendMessageToUpdateUrlList(
  url: string,
  isAlive: boolean,
  setUrlList: React.Dispatch<React.SetStateAction<ListOfDevnet[]>>
) {
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_URL_FROM_LIST',
      url,
      isAlive,
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to update url list');
      }
      setUrlList(response.urlList);
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
      item,
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to set new url into list');
      }
      setUrlList(response.urlList);
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
      url,
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to remove url from list');
      }
      setUrlList(response.urlList);
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
      }
      setUrlList(response.urlList);
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
      url,
      interval,
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to set new block inteval');
      }
      const newBlockInterval = setBlockIntervalFromObject(response.blockInterval);
      setBlockInterval(newBlockInterval);
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
      url,
    },
    (response) => {
      if (!response.success) {
        console.error('Failed to remove block interval');
      }
      const newBlockInterval = setBlockIntervalFromObject(response.blockInterval);
      setBlockInterval(newBlockInterval);
    }
  );
}

function setBlockIntervalFromObject(obj: Record<string, number>): Map<string, number> {
  return new Map(Object.entries(obj));
}
