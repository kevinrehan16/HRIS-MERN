import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Mag-set ng timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // I-clear ang timer kung nag-type ulit ang user bago matapos ang delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}