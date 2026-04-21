import { useEffect, useState } from "react";

/**
 * Tailwind のブレークポイント判定を CSS だけでは解決できない場合（レンダリング内容の出し分けなど）に使う。
 * 単純な表示/非表示なら CSS の responsive クラスを優先すること。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
