import { useMutation } from '@tanstack/react-query';
import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';
import { SendMessageToL2Params } from '../types';

const useSendMsgToL2 = () => {
  const { selectedUrl } = useSharedState();
  return useMutation({
    mutationFn: (params: SendMessageToL2Params) => starknetApi.sendMessageToL2(selectedUrl, params),
  });
};

export default useSendMsgToL2;
