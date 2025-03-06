import { initialState } from './state';
import { IRpcProviderState, IRpcProviderActionReducer, ActionType } from './types';

export const providerReducer = (
  state: IRpcProviderState,
  action: IRpcProviderActionReducer
): IRpcProviderState => {
  switch (action.type) {
    case ActionType.LOAD_RPC_PROVIDER:
      return {
        ...state,
        rpcProvider: action.payload?.rpcProvider,
        isLoading: action.payload?.isLoading as boolean,
      };
    case ActionType.CLEAR_STATE:
      return { ...initialState };
    case ActionType.IS_LOADING:
      return { ...state, isLoading: action.payload?.isLoading as boolean };
    default:
      return { ...initialState };
  }
};
