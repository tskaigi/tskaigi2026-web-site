"use client";

import { OnbordaProvider } from "onborda";
import { createContext, useContext, useMemo, useState } from "react";
import { TourOverlay } from "./TourOverlay";

type TourStepState = {
  /** Step 1 で追加したセッションID（Step 5 で削除対象に使う） */
  addedTalkId: string | null;
  setAddedTalkId: (id: string | null) => void;
};

const TourStepContext = createContext<TourStepState>({
  addedTalkId: null,
  setAddedTalkId: () => {},
});

export function useTourStepState() {
  return useContext(TourStepContext);
}

export function TourWrapper({ children }: { children: React.ReactNode }) {
  const [addedTalkId, setAddedTalkId] = useState<string | null>(null);
  const stepState = useMemo(
    () => ({ addedTalkId, setAddedTalkId }),
    [addedTalkId],
  );

  return (
    <OnbordaProvider>
      <TourStepContext.Provider value={stepState}>
        {children}
        <TourOverlay />
      </TourStepContext.Provider>
    </OnbordaProvider>
  );
}
