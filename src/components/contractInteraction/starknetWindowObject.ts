import { AccountChangeEventHandler, NetworkChangeEventHandler} from "get-starknet-core"
import { requestMessageHandler } from "./requestMessagesHandler/requestMessageHandler"
import type { WalletEvents,  StarknetWindowObject } from "get-starknet-core"
import { getIsPreauthorized } from "./messaging"
import { sendMessage, waitForMessage } from "./messageActions"
import { Account, RpcProvider } from "starknet-6"
import { RivetAccount } from "./rivetAccount"

export const userEventHandlers: WalletEvents[] = []

export const assertNever = (_: never): void => {
    // noop
  }

export const starknetWindowObject: StarknetWindowObject = {
    id: "rivet", // if ever changed you need to change it in get-starknet aswell
    name: "Rivet",
    icon: "",
    provider: undefined,
    isPreauthorized: async () => {
      return getIsPreauthorized()
    },
    isConnected: false,
    version: "v1",
    enable: async ({ starknetVersion = "v5" } = {}) => {
      const walletAccountP = Promise.race([
        waitForMessage("CONNECT_RIVET_DAPP_RES", 10 * 60 * 1000),
        waitForMessage("REJECT_RIVET_PREAUTHORIZATION", 10 * 60 * 1000).then(
          () => "USER_RIVET_ABORTED" as const,
        ),
      ])
      sendMessage({
        type: "CONNECT_RIVET_DAPP",
      })
      const walletAccount = await walletAccountP
      if (!walletAccount) {
        throw Error("No wallet account (should not be possible)")
      }
      if (walletAccount === "USER_ABORTED") {
        throw Error("User aborted")
      }
  
      if (!window.starknet_rivet) {
        throw Error("No starknet object detected")
      }
  
      const starknet = window.starknet_rivet as StarknetWindowObject
  
      const { address, private_key } = walletAccount.data
      const provider = new RpcProvider({ nodeUrl: 'http://127.0.0.1:8081/rpc' });
      starknet.provider = provider;
      starknet.account = new RivetAccount(address, private_key, provider);
      starknet.selectedAddress = address
      starknet.chainId = await provider.getChainId();
      starknet.isConnected = true
      return [address]
    },
    request: requestMessageHandler,
  
    on: (event, handleEvent) => {
      if (event === "accountsChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as AccountChangeEventHandler,
        })
      } else if (event === "networkChanged") {
        userEventHandlers.push({
          type: event,
          handler: handleEvent as NetworkChangeEventHandler,
        })
      } else {
        assertNever(event)
        throw new Error(`Unknwown event: ${event}`)
      }
    },
    off: (event, handleEvent) => {
      if (event !== "accountsChanged" && event !== "networkChanged") {
        assertNever(event)
        throw new Error(`Unknwown event: ${event}`)
      }
  
      const eventIndex = userEventHandlers.findIndex(
        (userEvent) =>
          userEvent.type === event && userEvent.handler === handleEvent,
      )
  
      if (eventIndex >= 0) {
        userEventHandlers.splice(eventIndex, 1)
      }
    },
  };
