import { useEffect, useState, useCallback, useRef } from "react";

interface UsePollingOptions<T, R = T> {
  fetchFn: () => Promise<T>;
  interval?: number;
  immediate?: boolean;
  transform?: (data: T) => R;
  onRequest?: (requestId: number, startTime: number) => void;
  onSuccess?: (requestId: number, startTime: number, data: T) => void;
  onError?: (requestId: number, startTime: number, error: unknown) => void;
}

export function usePolling<T, R = T>({
  fetchFn,
  interval = 1000,
  immediate = true,
  transform,
  onRequest,
  onSuccess,
  onError,
}: UsePollingOptions<T, R>) {
  const [data, setData] = useState<R | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const requestCountRef = useRef(0);
  const isPendingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);

  const onRequestRef = useRef(onRequest);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const fetchFnRef = useRef(fetchFn);
  const transformRef = useRef(transform);

  useEffect(() => {
    onRequestRef.current = onRequest;
  }, [onRequest]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const execute = useCallback(async () => {
    if (isPendingRef.current) return;

    isPendingRef.current = true;
    const startTime = performance.now();
    requestCountRef.current += 1;
    const requestId = requestCountRef.current;

    onRequestRef.current?.(requestId, startTime);

    try {
      setIsLoading(true);
      const result = await fetchFnRef.current();
      const fetchTime = performance.now() - startTime;

      const transformedData = transformRef.current
        ? transformRef.current(result)
        : (result as unknown as R);
      setData(transformedData);
      setError(null);

      onSuccessRef.current?.(requestId, fetchTime, result);
    } catch (err) {
      const errorTime = performance.now() - startTime;
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onErrorRef.current?.(requestId, errorTime, error);
    } finally {
      setIsLoading(false);
      isPendingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    intervalRef.current = window.setInterval(execute, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [execute, interval, immediate]);

  return { data, isLoading, error, refetch: execute };
}
