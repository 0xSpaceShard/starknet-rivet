import { useMutation } from '@tanstack/react-query';
import { useSharedState } from '../../../components/context/context';
import starknetApi from '../service';

const useFlush = () => {
  const { selectedUrl } = useSharedState();
  return useMutation({
    mutationFn: () => starknetApi.flush(selectedUrl),
  });
};

export default useFlush;
