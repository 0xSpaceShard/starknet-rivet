import browser from "webextension-polyfill";

console.info('contentScript is running')

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js");
// script.src = chrome.runtime.getURL("inpage.js")
const starknetRivetExtensionId = chrome.runtime.id
script.id = "starknet-rivet-extension"
script.setAttribute("data-extension-id", starknetRivetExtensionId)

container.insertBefore(script, container.children[0])

// const INJECT_NAMES = ["starknet_rivet"];

// INJECT_NAMES.forEach((name) => {
//   try {
//     // Check if the property exists before trying to delete it
//     if (name in window) {
//       delete (window as any)[name];
//     }
//   } catch (e) {
//     console.log('ERROR deleting property', e);
//   }

//   try {
//     // Assign the property directly to the window object
//     (window as any)[name] = starknetWindowObject;
//     console.log('window:', window.starknet_rivet);
//   } catch (error) {
//     console.log('ERROR assigning property', error);
//   }
// });

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

// const INJECT_NAMES = ["starknet_rivet"];


// INJECT_NAMES.forEach((name) => {
//     try {
//         // Check if the property exists before trying to delete it
//         if (!(name in window)) {
//           (window as any)[name] = starknetWindowObject;
          
//           console.log('window:', window);
//         }
//     } catch (e) {
//         console.log('ERROR deleting property', e);
//     }
  
    // try {
    //     // Assign the property directly to the window object
    //     (window as any)[name] = starknetWindowObject;
    //     console.log('window:', window.starknet_rivet);
    // } catch (error) {
    //     console.log('ERROR assigning property', error);
    // }
// });

// function codeToInject() {
//   // Do here whatever your script requires. For example:
//   // (window as any).starknet_rivet = "bar";
//   setTimeout(() => {(window as any).starknet_rivet = "bar"}, 100)
// }

// function embed(fn: any) {
//   const script = document.createElement("script");
//   // script.src = chrome.runtime.getURL('index.js');
//   script.text = `(${fn.toString()})();`;
//   document.documentElement.appendChild(script);
// }

// embed(codeToInject);

// function attach() {
//   console.log("HDGGHDGHDSFT")
//   INJECT_NAMES.forEach((name) => {
//     // we need 2 different try catch blocks because we want to execute both even if one of them fails
//     try {
//       delete (window as any)[name]
//     } catch (e) {
//       // ignore
//     }
//     try {
//       // set read only property to window
//       Object.defineProperty(window, name, {
//         value: starknetWindowObject,
//         writable: false,
//       })
//     } catch {
//       // ignore
//     }
//     try {
//       ;(window as any)[name] = starknetWindowObject
//     } catch {
//       // ignore
//     }
//   })
// }


// function attachHandler() {
//   attach()
//   setTimeout(attach, 100)
// }

// window.addEventListener("load", () => attachHandler())
// document.addEventListener("DOMContentLoaded", () => attachHandler())
// document.addEventListener("readystatechange", () => attachHandler())


// Inject starknet_rivet into the page context
// window.starknet_rivet = starknetWindowObject;


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.error("Content script message: ", request)
//   if (request.type === 'GET_SELECTED_COMPONENT') {
//     window.dispatchEvent(new CustomEvent('GET_SELECTED_COMPONENT'));
//   }
// });

// chrome.runtime.sendMessage({ type: 'contentScriptReady' });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === 'contentScriptReady') {
//     sendResponse({ type: 'backgroundReady' });
//   }
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

//   if (message.type === 'CHANGE_SELECTED_COMPONENT') {
//     const selectedComponent = message.selectedComponent;
//     console.log(`Changing selected component to: ${selectedComponent}`);
    
//     switch (selectedComponent) {
//       case 'DockerCommandGenerator':
//         sendMessageToScreen1(selectedComponent);
//         break;
//       case 'RegisterRunningDocker':
//         sendMessageToScreen1(selectedComponent);
//         break;
//       default:
//         sendMessageToScreen1('');
//         break;
//     }
//   }
// });

// function sendMessageToScreen1(selectedComponent: string) {
//     chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//       if (message.type === 'CHANGE_SELECTED_COMPONENT') {
//           // Send message to the web page
//           window.postMessage({type: 'CHANGE_SELECTED_COMPONENT', selectedComponent });
//       }
//   });

      
//   // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   //   console.log("TABS LEN: ", tabs.length)
//   //   const tab = tabs[0];
//   //   chrome.tabs.sendMessage(tab.id!, { type: 'CHANGE_SELECTED_COMPONENT', selectedComponent });
//   // });
// }