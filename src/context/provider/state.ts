import { IProviderActions, IProviderState } from './types';

export const initialState: IProviderState = {
  provider: undefined,
  isLoading: false,
};

export const initialActions: IProviderActions = {
  loadProvider: () => {},
  clearState: () => {},
};
