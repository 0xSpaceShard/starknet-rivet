import { getBlockIntervalFromSyncStorage } from './syncStorage';

// Listener for Chrome alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  const alarmName = alarm.name;

  if (alarmName.startsWith('mintBlockAlarm_')) {
    const url = alarmName.replace('mintBlockAlarm_', '');
    mintBlock(url);
  }
});

// Function to create an alarm (or clear and creat new one) that will mint block at this interval
export async function createMintBlockAlarm(url: string, interval: number): Promise<void> {
  try {
    const blockInterval = await getBlockIntervalFromSyncStorage();

    chrome.alarms.get(`mintBlockAlarm_${url}`, async (existingAlarm) => {
      if (existingAlarm) {
        // If an alarm exists, clear it
        chrome.alarms.clear(`mintBlockAlarm_${url}`, (cleared) => {
          if (cleared) {
            // Update block interval and set new alarm
            updateAndSetAlarm(url, interval, blockInterval);
          } else {
            console.error(`Failed to clear existing alarm for URL: ${url}`);
          }
        });
      } else {
        // If no existing alarm, directly set the new alarm
        updateAndSetAlarm(url, interval, blockInterval);
      }
    });
  } catch (error) {
    console.error('Error create Mint Block Alarm:', error);
  }
}

// Function that update the alarm to mint block for the new interval
export function updateAndSetAlarm(
  url: string,
  interval: number,
  blockInterval: Map<string, number>
): void {
  blockInterval.set(url, interval);
  chrome.storage.local.set({ blockInterval: Object.fromEntries(blockInterval) }, () => {
    // Create a new alarm with the specified URL and interval
    const intervalMinutes = interval / (1000 * 60);
    chrome.alarms.create(`mintBlockAlarm_${url}`, { periodInMinutes: intervalMinutes });
  });
}

// Function that mint new block for the given devnet URL
export async function mintBlock(url: string): Promise<void> {
  try {
    const response = await fetch(`${url}/create_block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      console.log(`Minted block for ${url}`);
    } else {
      console.error('Error creating block:', response.statusText);
    }
  } catch (error) {
    console.error('Error creating block:', error);
  }
}
