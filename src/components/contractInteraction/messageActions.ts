import {
  Abi,
  ArraySignatureType,
  Call,
  InvocationsDetails,
  WalletAccount,
  TypedData,
  DeclareContractPayload,
} from 'starknet-6';
import { AccountData } from '../context/interfaces';
import { GetDeploymentDataResult, WatchAssetParameters } from 'starknet-types';

export interface ExecuteTransactionRequest {
  transactions: Call | Call[];
  abis?: Abi[];
  transactionsDetail?: InvocationsDetails;
}

export type PreAuthorisationMessage =
  | { type: 'CONNECT_RIVET_DAPP'; data?: { silent?: boolean } }
  | {
      type: 'CONNECT_RIVET_DAPP_RES';
      success: boolean;
      data: {
        selectedAccount: AccountData;
        url: string;
      };
    }
  | { type: 'RIVET_IS_PREAUTHORIZED' }
  | { type: 'RIVET_IS_PREAUTHORIZED_RES'; data: boolean }
  | {
      type: 'REJECT_RIVET_PREAUTHORIZATION';
      data?: { host: string; actionHash: string };
    }
  | { type: 'CONNECT_RIVET_ACCOUNT_RES'; data: any }
  | { type: 'DISCONNECT_RIVET_ACCOUNT' };

export type TransactionMessage =
  | {
      type: 'EXECUTE_RIVET_TRANSACTION';
      data: ExecuteTransactionRequest;
      gas_fee?: string;
      error?: string;
    }
  | { type: 'EXECUTE_RIVET_TRANSACTION_RES'; data: { transaction_hash: string; error?: string } }
  | {
      type: 'SIMULATE_RIVET_TRANSACTION';
      data: ExecuteTransactionRequest;
    }
  | {
      type: 'SIMULATE_RIVET_TRANSACTION_RES';
      data: {
        data: Call | Call[];
        gas_fee: string;
        error: string | null;
      };
    }
  | {
      type: 'RIVET_TRANSACTION_FAILED';
      data: {
        transaction_hash: string;
        error?: string;
      };
    };

export type NetworkMessage = {
  type: 'RIVET_APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK';
  data: { actionHash: string; selectedAccount: WalletAccount };
};

export type RequestMessageHandler =
  | { type: 'DEPLOYMENT_DATA_HANDLER'; data?: { silent?: boolean } }
  | {
      type: 'DEPLOYMENT_DATA_HANDLER_RES';
      data: GetDeploymentDataResult;
    }
  | {
      type: 'REQUEST_CHAIN_ID_HANDLER';
      data?: { silent?: boolean };
    }
  | { type: 'REQUEST_CHAIN_ID_HANDLER_RES'; data: { chainId: string; error?: string } }
  | {
      type: 'WATCH_ASSET_HANDLER';
      data: WatchAssetParameters;
    }
  | { type: 'WATCH_ASSET_HANDLER_RES'; data: boolean }
  | {
      type: 'SWITCH_STARKNET_CHAIN';
      data: { chainId: string };
    }
  | { type: 'SWITCH_STARKNET_CHAIN_RES'; data: boolean }
  | {
      type: 'REQUEST_DECLARE_CONTRACT';
      data: { payload: DeclareContractPayload };
    }
  | {
      type: 'REQUEST_DECLARE_CONTRACT_RES';
      data: { transaction_hash?: string; class_hash?: string; error?: string };
    };

export interface SignMessageOptions {
  skipDeploy: boolean;
}

export type ActionMessage =
  | {
      type: 'SIGN_RIVET_MESSAGE';
      data: { typedData: TypedData; options: SignMessageOptions };
    }
  | { type: 'SIGN_RIVET_MESSAGE_RES'; data: ArraySignatureType }
  | { type: 'SIGNATURE_RIVET_FAILURE'; data: { error: string } };

export type MessageType =
  | PreAuthorisationMessage
  | TransactionMessage
  | ActionMessage
  | NetworkMessage
  | RequestMessageHandler;

export type WindowMessageType = MessageType & {
  forwarded?: boolean;
  extensionId: string;
};

const extensionId = document
  .getElementById('starknet-rivet-extension')
  ?.getAttribute('data-extension-id');

export function sendMessage(msg: any): void {
  return window.postMessage({ ...msg, extensionId }, window.location.origin);
}

export function waitForMessage<K extends MessageType['type'], T extends { type: K } & MessageType>(
  type: K,
  timeout: number,
  predicate: (x: T) => boolean = () => true
): Promise<T extends { data: infer S } ? S : undefined> {
  return new Promise((resolve, reject) => {
    const pid = setTimeout(() => reject(new Error('Timeout')), timeout);
    const handler = (event: MessageEvent<WindowMessageType>) => {
      if (event.data.type !== type || !predicate(event.data as any)) return;

      clearTimeout(pid);
      window.removeEventListener('message', handler);
      resolve(('data' in event.data ? event.data.data : undefined) as any);
    };
    window.addEventListener('message', handler);
  });
}
