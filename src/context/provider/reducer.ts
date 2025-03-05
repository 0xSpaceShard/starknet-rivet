import { initialState } from './state';
import { IProviderState, IProviderActionReducer, ActionType } from './types';

export const providerReducer = (
  state: IProviderState,
  action: IProviderActionReducer
): IProviderState => {
  switch (action.type) {
    case ActionType.LOAD_PROVIDER:
      return {
        ...state,
        provider: action.payload?.provider,
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
