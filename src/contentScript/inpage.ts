import { RivetAccount } from "../components/contractInteraction/rivetAccount";
import { RpcProvider } from "starknet-6";
import { assertNever, userEventHandlers } from "../components/contractInteraction/starknetWindowObject";
import { WindowMessageType } from "../components/contractInteraction/messageActions";

async function loadModules() {
  const { starknetWindowObject } = await import("../components/contractInteraction/starknetWindowObject");
  const { sendMessage, waitForMessage } = await import("../components/contractInteraction/messageActions");
  const INJECT_NAMES = ["starknet_rivet"];
  function attach() {
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
            } else {
                // If it's not configurable, log an error or handle it accordingly
                console.error("Cannot modify read-only and non-configurable property:", name);
            }
        } else {
            // If it doesn't exist or is already writable, assign directly
            (window as any)[name]  = starknetWindowObject;
        }
    });
    console.log("end attached: ", window.starknet_rivet);
  }

  window.addEventListener("load", attach);
  document.addEventListener("DOMContentLoaded", attach);
  document.addEventListener("readystatechange", attach);

  window.addEventListener(
    "message",
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async ({ data }: MessageEvent<WindowMessageType>) => {
      if (!window.starknet_rivet) {
        return
      }
  
      const starknet = window.starknet_rivet
      if (
        data.type === "CONNECT_RIVET_ACCOUNT_RES" ||
        data.type === "RIVET_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK"
      ) {
            const account =
            data.type === "CONNECT_RIVET_ACCOUNT_RES"
                ? data.data
                : data.data.selectedAccount
            if (
            account &&
            (account.address !== starknet.selectedAddress) 
            ){
            sendMessage({
                type: "CONNECT_RIVET_DAPP",
            })
            const walletAccountP = Promise.race([
                waitForMessage("CONNECT_RIVET_DAPP_RES", 10 * 60 * 1000),
                waitForMessage("REJECT_RIVET_PREAUTHORIZATION", 10 * 60 * 1000).then(
                () => "USER_RIVET_ABORTED" as const,
                ),
            ])
            const walletAccount = await walletAccountP
          if (!walletAccount || walletAccount === "USER_ABORTED") {
            return sendMessage({ type: "DISCONNECT_RIVET_ACCOUNT" })
          }
  
          const { address, private_key } = walletAccount.data
          const url  = walletAccount.url;
          const provider = new RpcProvider({ nodeUrl: `http://${url}/rpc` });

          starknet.selectedAddress = address
          starknet.chainId = await provider.getChainId();
          starknet.provider = provider
          starknet.account = new RivetAccount(address, private_key, provider)
          for (const userEvent of userEventHandlers) {
            if (userEvent.type === "accountsChanged") {
              userEvent.handler([address])
            } else if (userEvent.type === "networkChanged") {
              userEvent.handler(starknet.chainId as any)
            } else {
              assertNever(userEvent)
            }
          }
        }
      } else if (data.type === "DISCONNECT_RIVET_ACCOUNT") {
        starknet.selectedAddress = undefined
        starknet.account = undefined
        starknet.isConnected = false
        for (const userEvent of userEventHandlers) {
          if (userEvent.type === "accountsChanged") {
            userEvent.handler([])
          } else if (userEvent.type === "networkChanged") {
            userEvent.handler(undefined)
          } else {
            assertNever(userEvent)
          }
        }
      }
    }
  )
}


loadModules();
