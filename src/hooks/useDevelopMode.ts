"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const STORAGE_KEY = "develop-mode";

export function useDevelopMode(): boolean {
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("develop");

  return useMemo(() => {
    if (paramValue === "true") {
      sessionStorage.setItem(STORAGE_KEY, "true");
      return true;
    }
    if (paramValue === "false") {
      sessionStorage.removeItem(STORAGE_KEY);
      return false;
    }
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  }, [paramValue]);
}
