import React from 'react';
import { RpcProvider } from 'starknet-6';

export enum ActionType {
  LOAD_PROVIDER,
  IS_LOADING,
  CLEAR_STATE,
}

export interface IProviderActions {
  loadProvider: (provider: RpcProvider | undefined) => void;
  clearState: () => void;
}

export interface IProviderState {
  provider: RpcProvider | undefined;
  isLoading: boolean;
}

export interface IProviderActionReducer {
  type: ActionType;
  payload?: {
    provider?: RpcProvider;
    isLoading?: boolean;
  };
}

export interface IProviderProps {
  children: React.ReactNode;
}
