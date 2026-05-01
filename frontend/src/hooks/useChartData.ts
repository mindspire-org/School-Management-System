import { useCallback, useEffect, useState } from 'react';

export type DateRangePreset = '7' | '30' | '365';

export type UseChartDataResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  range: DateRangePreset;
  setRange: (range: DateRangePreset) => void;
  refetch: () => void;
};

export default function useChartData<T>(
  fetcher: (range: DateRangePreset) => Promise<T>,
  initialRange: DateRangePreset = '30'
): UseChartDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [range, setRange] = useState<DateRangePreset>(initialRange);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetcher(range)
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e : new Error('Failed to load data'));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fetcher, nonce, range]);

  return { data, loading, error, range, setRange, refetch };
}
