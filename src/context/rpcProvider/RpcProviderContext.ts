import React from 'react';
import { IRpcProviderActions, IRpcProviderState } from './types';
import { initialActions, initialState } from './state';

export const RpcProviderStateContext = React.createContext<IRpcProviderState>(initialState);
export const RpcProviderActionsContext = React.createContext<IRpcProviderActions>(initialActions);

export const useRpcProviderState = () => React.useContext(RpcProviderStateContext);
export const useRpcProviderActions = () => React.useContext(RpcProviderActionsContext);
