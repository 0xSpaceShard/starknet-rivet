import { useEffect, useState } from 'react';

export function useFetchData<T>(
  initialValue: T,
  fetcher: () => Promise<T>,
  updater: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    setIsLoading(true);
    try {
      const response = await fetcher();
      setData(response);
    } catch (err) {
      throw new Error(`Failed fetching data. ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (updatedData: T) => {
    const response = await updater(updatedData);
    setData(response);
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    data,
    isLoading,
    fetch,
    update,
  };
}
