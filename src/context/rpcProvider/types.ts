import React from 'react';
import { RpcProvider } from 'starknet-6';

export enum ActionType {
  LOAD_RPC_PROVIDER,
  IS_LOADING,
  CLEAR_STATE,
}

export interface IRpcProviderActions {
  loadRpcProvider: (provider: RpcProvider | undefined) => void;
  clearState: () => void;
}

export interface IRpcProviderState {
  rpcProvider: RpcProvider | undefined;
  isLoading: boolean;
}

export interface IRpcProviderActionReducer {
  type: ActionType;
  payload?: {
    rpcProvider?: RpcProvider;
    isLoading?: boolean;
  };
}

export interface IRpcProviderProps {
  children: React.ReactNode;
}
