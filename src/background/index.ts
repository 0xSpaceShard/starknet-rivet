import { starknetWindowObject } from "../components/contractInteraction/starknetWindowObject";

console.log('background is running')

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     const tab = tabs[0];
//     if (tab) {
//       chrome.scripting.executeScript({
//         target: { tabId: tab.id as number},
//         func: () => {
//           const INJECT_NAMES: string[] = ["starknet_rivet"];
//           const starknetWindowObject: Record<string, unknown> = {}; // Your starknetWindowObject

//           INJECT_NAMES.forEach((name) => {
//             try {
//               // Check if the property exists before trying to delete it
//               if (name in window) {
//                 delete (window as any)[name];
//               }
//             } catch (e) {
//               console.error('ERROR deleting property', e);
//             }

//             try {
//               // Assign the property directly to the window object
//               (window as any)[name] = starknetWindowObject;
//               console.log('window:', window.starknet_rivet);
//             } catch (error) {
//               console.error('ERROR assigning property', error);
//             }
//           });
//         },
//       });
//     } else {
//       console.error('No active tab found.');
//     }
//   });
// });

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]) {
//           chrome.scripting.executeScript({
//               target: { tabId: tabs[0].id as number },
//               function: () => {
//                   const INJECT_NAMES = ["starknet_rivet"];

//                   INJECT_NAMES.forEach((name) => {
//                       try {
//                           // Check if the property exists before trying to delete it
//                           if (name in window) {
//                               delete (window as any)[name];
//                           }
//                       } catch (e) {
//                           console.log('ERROR deleting property', e);
//                       }
                    
//                       try {
//                           // Assign the property directly to the window object
//                           (window as any)[name] = starknetWindowObject;
//                           console.log('window:', window.starknet_rivet);
//                       } catch (error) {
//                           console.log('ERROR assigning property', error);
//                       }
//                   });
//               },
//           });
//       }
//   });
// });

// function getTabID() {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]) {
//       const tabId = tabs[0].id;
//       console.log("Tab ID:", tabId);
//       return tabId;
//     } else {
//       console.error("No active tab found.");
//     }
//   });
// }

// chrome.runtime.onInstalled.addListener(() => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0]) {
//       chrome.scripting.executeScript({
//         target: { tabId: getTabID(), allFrames : true },
//         func: () => {
//           const INJECT_NAMES = ["starknet_rivet"];
//           INJECT_NAMES.forEach((name) => {
//             try {
//               if (name in window) {
//                 delete (window as any)[name];
//               }
//             } catch (e) {
//               console.log('ERROR deleting property', e);
//             }
          
//             try {
//               (window as any)[name] = starknetWindowObject;
//               console.log('window:', window.starknet_rivet);
//             } catch (error) {
//               console.log('ERROR assigning property', error);
//             }
//           });
//         },
//       }).then(() => console.log("injected a function"));;
//     }
//   });
// });

function getTabID(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0 && tabs[0].id !== undefined) {
        const tabId = tabs[0].id;
        console.log("Tab ID:", tabId);
        resolve(tabId);
      } else {
        console.error("No active tab found.");
        reject(new Error("No active tab found."));
      }
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  getTabID()
    .then((tabId) => {
      chrome.scripting.executeScript({
        target: { tabId: tabId, allFrames: true },
        world: 'MAIN',
        func: () => {
          const INJECT_NAMES = ["starknet_rivet"];
          INJECT_NAMES.forEach((name) => {
            try {
              if (name in window) {
                delete (window as any)[name];
              }
            } catch (e) {
              console.log('ERROR deleting property', e);
            }
          
            try {
              (window as any)[name] = starknetWindowObject;
              console.log('window:', window.starknet_rivet);
            } catch (error) {
              console.log('ERROR assigning property', error);
            }
          });
        },
      }).then(() => console.log("Injected a function"));
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('background message: ', message)
  if (message.type === 'GET_SELECTED_COMPONENT') {
    chrome.storage.sync.get(['selectedComponent'], (result) => {
      const selectedComponent = result.selectedComponent || '';
      sendResponse({ selectedComponent });
    });
    return true;
  } else if (message.type === 'SET_SELECTED_COMPONENT') {
    chrome.storage.sync.set({ selectedComponent: message.selectedComponent });
  }
});

// chrome.tabs.onActivated.addListener(function(tab) {
//   chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
//     console.error("TABS Background: ", tabs[8].id)
//     chrome.tabs.sendMessage(tabs[8].id as number, {message: "SELECTED_COMPONENT_CHANGED"}, function(response){
//       console.error("Respo: ", response)
//     })
//   })
// })

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (tab) {
    chrome.tabs.sendMessage(tab.id as number, { type: 'SELECTED_COMPONENT_CHANGED', data: 'someData' });
  }
});
