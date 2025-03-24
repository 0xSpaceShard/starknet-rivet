import { useMutation } from '@tanstack/react-query';
import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';
import { ConsumeMessageFromL2Params } from '../types';

const useConsumeMsgFromL2 = () => {
  const { selectedUrl } = useSharedState();
  return useMutation({
    mutationFn: (params: ConsumeMessageFromL2Params) =>
      starknetApi.consumeMessageFromL2(selectedUrl, params),
  });
};

export default useConsumeMsgFromL2;
