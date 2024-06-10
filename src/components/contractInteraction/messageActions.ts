import { Abi, ArraySignatureType, Call, InvocationsDetails, TypedData } from "starknet";

export interface ExecuteTransactionRequest {
  transactions: Call | Call[]
  abis?: Abi[]
  transactionsDetail?: InvocationsDetails
}

export type PreAuthorisationMessage =
  | { type: "CONNECT_RIVET_DAPP"; data?: { silent?: boolean } }
  | { type: "CONNECT_RIVET_DAPP_RES"; data: any }
  | { type: "RIVET_IS_PREAUTHORIZED" }
  | { type: "RIVET_IS_PREAUTHORIZED_RES"; data: boolean }
  | {
      type: "REJECT_RIVET_PREAUTHORIZATION"
      data?: { host: string; actionHash: string }
    }
  | { type: "CONNECT_ACCOUNT_RES"; data: any }

  export type TransactionMessage =
  | {
      type: "EXECUTE_RIVET_TRANSACTION"
      data: ExecuteTransactionRequest
    }
  | { type: "EXECUTE_RIVET_TRANSACTION_RES"; data: any }
  | {
      type: "RIVET_TRANSACTION_SUBMITTED"
      data: { txHash: string; actionHash: string }
    }
  | {
      type: "RIVET_TRANSACTION_FAILED"
      data: { actionHash: string; error?: string }
    }


export interface SignMessageOptions {
  skipDeploy: boolean
}

export type ActionMessage =
  | {
      type: "SIGN_RIVET_MESSAGE"
      data: { typedData: TypedData; options: SignMessageOptions }
    }
  | { type: "SIGN_RIVET_MESSAGE_RES"; data: any }
  | { type: "SIGNATURE_RIVET_FAILURE"; data: { error: string } }
  | {
      type: "SIGNATURE_RIVET_SUCCESS"
      data: { signature: ArraySignatureType; data: any }
    }

export type MessageType =
    | PreAuthorisationMessage
    | TransactionMessage
    | ActionMessage;

export type WindowMessageType = MessageType & {
    forwarded?: boolean
    extensionId: string
}

const extensionId = document
  .getElementById("starknet-rivet-extension")
  ?.getAttribute("data-extension-id")

export function sendMessage(msg: any): void {
  return window.postMessage({ ...msg, extensionId }, window.location.origin)
}

export function waitForMessage<
  K extends MessageType["type"],
  T extends { type: K } & MessageType,
>(
  type: K,
  timeout: number,
  predicate: (x: T) => boolean = () => true,
): Promise<T extends { data: infer S } ? S : undefined> {
  return new Promise((resolve, reject) => {
    const pid = setTimeout(() => reject(new Error("Timeout")), timeout)
    const handler = (event: MessageEvent<WindowMessageType>) => {
      if (event.data.type === type && predicate(event.data as any)) {
        clearTimeout(pid)
        window.removeEventListener("message", handler)
        return resolve(
          ("data" in event.data ? event.data.data : undefined) as any,
        )
      }
    }
    window.addEventListener("message", handler)
  })
}
