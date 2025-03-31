import React from 'react';
import { RpcProvider as RpcConstructor } from 'starknet';

import { providerReducer } from './reducer';
import { initialState } from './state';
import { useSharedState } from '../../components/context/context';
import { ActionType, IRpcProviderProps } from './types';
import { logError } from '../../background/analytics';
import { RpcProviderActionsContext, RpcProviderStateContext } from './RpcProviderContext';

const RpcProvider = ({ children }: IRpcProviderProps) => {
  const [state, dispatch] = React.useReducer(providerReducer, initialState);

  const { selectedUrl: url } = useSharedState();

  const loadRpcProvider = React.useCallback(() => {
    try {
      dispatch({
        type: ActionType.IS_LOADING,
        payload: { isLoading: true },
      });

      if (!url) return;

      const provider = new RpcConstructor({ nodeUrl: `${url}/rpc` });

      dispatch({
        type: ActionType.LOAD_RPC_PROVIDER,
        payload: { rpcProvider: provider },
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
    loadRpcProvider();
  }, [url]);

  const clearState = () =>
    dispatch({
      type: ActionType.CLEAR_STATE,
    });

  const actions = React.useMemo(
    () => ({
      loadRpcProvider,
      clearState,
    }),
    [loadRpcProvider, clearState]
  );

  return (
    <RpcProviderStateContext.Provider value={state}>
      <RpcProviderActionsContext.Provider value={actions}>
        {children}
      </RpcProviderActionsContext.Provider>
    </RpcProviderStateContext.Provider>
  );
};

export default RpcProvider;
