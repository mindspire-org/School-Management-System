import { useCallback, useState } from 'react';

export default function useApi(asyncFunc, { immediate = false, onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await asyncFunc(...args);
      setData(res);
      onSuccess && onSuccess(res);
      return { data: res, error: null };
    } catch (e) {
      setError(e);
      onError && onError(e);
      return { data: null, error: e };
    } finally {
      setLoading(false);
    }
  }, [asyncFunc, onSuccess, onError]);

  return { execute, loading, error, data, setData };
}
