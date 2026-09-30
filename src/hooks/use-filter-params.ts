"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Client-side helper for a page's filter bar. `setParam` clones the current
 * search params and only touches the one key being changed, so switching one
 * filter never drops the others — the URL is always the full filter state.
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      push(params);
    },
    [searchParams, push]
  );

  const clearParams = useCallback(
    (keys: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const key of keys) params.delete(key);
      push(params);
    },
    [searchParams, push]
  );

  return { searchParams, setParam, clearParams };
}
