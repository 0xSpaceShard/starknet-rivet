import { AccountData } from '../context/interfaces';

export async function sendAccountUpdatedMessage(selectedAccount: AccountData | null) {
  const tabs = await chrome.tabs.query({});

  tabs.forEach((tab) => {
    chrome.tabs.sendMessage(
      tab.id as number,
      {
        type: 'SELECTED_ACCOUNT_UPDATED',
        data: selectedAccount,
      },
      (response) => {
        if (!chrome.runtime.lastError) {
          console.log(`Message sent to tab ${tab.id}:`, response);
        }
      }
    );
  });
  chrome.runtime.sendMessage({
    type: 'SELECTED_ACCOUNT_UPDATED',
    data: {
      selectedAccount: selectedAccount,
    },
  });
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
      },
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
      },
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

function setBlockIntervalFromObject(obj: Record<string, number>): Map<string, number> {
  return new Map(Object.entries(obj));
}
