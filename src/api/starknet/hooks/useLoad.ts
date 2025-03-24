import { useMutation } from '@tanstack/react-query';
import starknetApi from '../service';
import { useSharedState } from '../../../components/context/context';

const useLoad = () => {
  const { l1NodePort, selectedUrl } = useSharedState();
  return useMutation({
    mutationFn: () =>
      starknetApi.load(selectedUrl, { networkUrl: `http://host.docker.internal:${l1NodePort}` }),
  });
};

export default useLoad;
