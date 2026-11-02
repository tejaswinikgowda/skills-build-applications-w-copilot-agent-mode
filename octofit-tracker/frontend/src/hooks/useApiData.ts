import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ApiDataState<T> = {
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
};

export function useApiData<T>(path: string): ApiDataState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(undefined);

    getJson<T>(path).then(
      (result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      },
      (reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load data.');
          setLoading(false);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [path]);

  return { data, error, loading };
}
