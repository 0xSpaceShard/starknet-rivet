import React from 'react';
import { IProviderActions, IProviderState } from './types';
import { initialActions, initialState } from './state';

export const ProviderStateContext = React.createContext<IProviderState>(initialState);
export const ProviderActionsContext = React.createContext<IProviderActions>(initialActions);

export const useProviderState = () => React.useContext(ProviderStateContext);
export const useProviderActions = () => React.useContext(ProviderActionsContext);
