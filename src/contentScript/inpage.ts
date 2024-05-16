// import { starknetWindowObject } from "../components/contractInteraction/starknetWindowObject";

// const INJECT_NAMES = ["starknet_rivet"];

// function attach() {
//   console.log("HDGGHDGHDSFT")
//   INJECT_NAMES.forEach((name) => {
//     // we need 2 different try catch blocks because we want to execute both even if one of them fails
//     try {
//       delete (window as any)[name]
//       console.log("try 1")
//     } catch (e) {
//       console.log("catch 1: ", e)
//     }
//     try {
//       // set read only property to window
//       Object.defineProperty(window, name, {
//         value: starknetWindowObject,
//         writable: false,
//       })
//       console.log("try 2")
//     } catch (e) {
//       console.log("catch 2: ", e)
//     }
//     try {
//       (window as any)[name] = starknetWindowObject;
//       console.log("try 3")
//     } catch (e) {
//       console.log("catch 3: ", e)
//     }
//   })
//   console.log("end attached: ", window.starknet_rivet)
// }


// function attachHandler() {
//   attach()
//   setTimeout(attach, 1000)
// }

// window.addEventListener("load", () => attachHandler())
// document.addEventListener("DOMContentLoaded", () => attachHandler())
// document.addEventListener("readystatechange", () => attachHandler())

async function loadModules() {
  const { starknetWindowObject } = await import("../components/contractInteraction/starknetWindowObject");
  const INJECT_NAMES = ["starknet_rivet"];
  // function attach() {
  //     console.log("HDGGHDGHDSFT");
  //     INJECT_NAMES.forEach((name) => {
  //         try {
  //           if (Object.getOwnPropertyDescriptor(window, name)) {
  //             Object.defineProperty(window, name, {
  //                 writable: true,
  //                 configurable: true // Ensure it's configurable to change it again
  //             });
  //             delete window[name as any]; // Now delete it safely
  //         }
  //             console.log("try 1");
  //         } catch (e) {
  //             console.log("catch 1: ", e);
  //         }
  //         try {
  //           Object.defineProperty(window, name, {
  //             value: starknetWindowObject,
  //             writable: false,
  //             configurable: true // Keep it configurable in case you need to modify it again
  //         });
  //             console.log("try 2");
  //         } catch (e) {
  //             console.log("catch 2: ", e);
  //         }
  //         try {
  //           (window as any)[name] = starknetWindowObject;
  //             console.log("try 3");
  //         } catch (e) {
  //             console.log("catch 3: ", e);
  //         }
  //     });
  //     console.log("end attached: ", window.starknet_rivet);
  // }
  function attach() {
    console.log("HDGGHDGHDSFT");
    INJECT_NAMES.forEach((name) => {
        // Check if the property exists and modify it if it's configurable
        const descriptor = Object.getOwnPropertyDescriptor(window, name);
        if (descriptor && !descriptor.writable) {
            // Property exists and is read-only
            if (descriptor.configurable) {
                // If it's configurable, we can change it to be writable
                Object.defineProperty(window, name, {
                    value: starknetWindowObject,
                    writable: true,  // Now making it writable
                    configurable: true  // Keep it configurable
                });
                console.log("Updated read-only property:", name);
            } else {
                // If it's not configurable, log an error or handle it accordingly
                console.error("Cannot modify read-only and non-configurable property:", name);
            }
        } else {
            // If it doesn't exist or is already writable, assign directly
            (window as any)[name]  = starknetWindowObject;
            console.log("Assigned property:", name);
        }
    });
    console.log("end attached: ", window.starknet_rivet);
  }

  window.addEventListener("load", attach);
  document.addEventListener("DOMContentLoaded", attach);
  document.addEventListener("readystatechange", attach);
}

loadModules();
