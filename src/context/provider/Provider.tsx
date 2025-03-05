import React from 'react';
import { RpcProvider } from 'starknet-6';

import { ProviderActionsContext, ProviderStateContext } from './ProviderContext';
import { providerReducer } from './reducer';
import { initialState } from './state';
import { useSharedState } from '../../components/context/context';
import { ActionType, IProviderProps } from './types';
import { logError } from '../../background/analytics';

const Provider = ({ children }: IProviderProps) => {
  const [state, dispatch] = React.useReducer(providerReducer, initialState);

  const { selectedUrl: url } = useSharedState();

  const loadProvider = React.useCallback(() => {
    try {
      dispatch({
        type: ActionType.IS_LOADING,
        payload: { isLoading: true },
      });

      const provider = new RpcProvider({ nodeUrl: `${url}/rpc` });

      dispatch({
        type: ActionType.LOAD_PROVIDER,
        payload: { provider },
      });

      dispatch({
        type: ActionType.IS_LOADING,
        payload: { isLoading: false },
      });
    } catch (error) {
      dispatch({
        type: ActionType.CLEAR_STATE,
      });
      logError('Error loading provider', error);
    }
  }, [url]);

  React.useEffect(() => {
    loadProvider();
  }, [url]);

  const clearState = () =>
    dispatch({
      type: ActionType.CLEAR_STATE,
    });

  const actions = React.useMemo(
    () => ({
      loadProvider,
      clearState,
    }),
    []
  );

  return (
    <ProviderStateContext.Provider value={state}>
      <ProviderActionsContext.Provider value={actions}>{children}</ProviderActionsContext.Provider>
    </ProviderStateContext.Provider>
  );
};

export default Provider;
