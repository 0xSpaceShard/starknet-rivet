import { AccountChangeEventHandler, NetworkChangeEventHandler} from "get-starknet-core"
import { requestMessageHandler } from "./requestMessagesHandler/requestMessageHandler"
import type { WalletEvents } from "get-starknet-core"
import { StarknetWindowObject } from "starknet-types"

export const userEventHandlers: WalletEvents[] = []

export const assertNever = (_: never): void => {
    // noop
  }

export const starknetWindowObject: StarknetWindowObject = {
    id: "SpaceWallet", // if ever changed you need to change it in get-starknet aswell
    name: "Space Wallet",
    icon: "",
    // account: undefined,
    // provider: undefined,
    // selectedAddress: undefined,
    // chainId: undefined,
    // isConnected: false,
    version: "v1",
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
