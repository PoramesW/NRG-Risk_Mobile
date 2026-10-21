import { useCallback, useEffect, useState } from 'react';

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loader();
      setState({ data, loading: false, error: null });
    } catch (e) {
      setState({
        data: null,
        loading: false,
        error: e instanceof Error ? e.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล',
      });
    }
  }, [loader]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}