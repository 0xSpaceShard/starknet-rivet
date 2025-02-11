/* eslint-disable no-restricted-globals */

// const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
// const API_SECRET = 'API';
const CLIENT_ID_KEY = 'ga_client_id';

async function getClientId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get([CLIENT_ID_KEY], (result) => {
      if (result[CLIENT_ID_KEY]) {
        resolve(result[CLIENT_ID_KEY]);
      } else {
        const newClientId = crypto.randomUUID(); // Generate a unique ID
        chrome.storage.local.set({ [CLIENT_ID_KEY]: newClientId });
        resolve(newClientId);
      }
    });
  });
}

export async function sendAnalyticsEvent(eventName: string, params: Record<string, any> = {}) {
  const clientId = await getClientId();
  const payload = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };

  try {
    await fetch(
      `dummyurl`,
      // `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${API_SECRET}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  } catch (error) {
    console.error('Failed to send analytics event:', error);
  }
}

export function logError(
  errorMessage: string,
  error: any = null,
  context: Record<string, any> = {}
) {
  console.debug(errorMessage, error);
  sendAnalyticsEvent('extension_error', { message: errorMessage, ...context });
}

export function setupErrorTracking() {
  self.addEventListener('error', (event) => {
    sendAnalyticsEvent('extension_error', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
    });
  });

  self.addEventListener('unhandledrejection', (event) => {
    sendAnalyticsEvent('unhandled_promise_rejection', {
      reason: event.reason,
    });
  });
}
