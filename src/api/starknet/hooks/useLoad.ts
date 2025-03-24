import { useMutation } from '@tanstack/react-query';
import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';
import { useL1Node } from '../../../components/hooks/useL1Node';

const useLoad = () => {
  const { selectedUrl } = useSharedState();
  const { data: l1NodePort } = useL1Node();
  return useMutation({
    mutationFn: () =>
      starknetApi.load(selectedUrl, { networkUrl: `http://host.docker.internal:${l1NodePort}` }),
  });
};

export default useLoad;
