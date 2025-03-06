import { IRpcProviderActions, IRpcProviderState } from './types';

export const initialState: IRpcProviderState = {
  rpcProvider: undefined,
  isLoading: false,
};

export const initialActions: IRpcProviderActions = {
  loadRpcProvider: () => {},
  clearState: () => {},
};
