"use client";

import { useEffect, useState } from "react";

type ToastItem = {
  id: number;
  message: string;
};

type AppToastDetail = {
  message: string;
};

export function showAppToast(message: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AppToastDetail>("app-toast", {
      detail: { message },
    }),
  );
}

export function GlobalToast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    let idSeed = 1;

    const onToast = (event: Event) => {
      const customEvent = event as CustomEvent<AppToastDetail>;
      const message = customEvent.detail?.message;
      if (!message) return;

      const id = idSeed;
      idSeed += 1;

      setItems((prev) => [...prev, { id, message }]);

      window.setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 2400);
    };

    window.addEventListener("app-toast", onToast);

    return () => {
      window.removeEventListener("app-toast", onToast);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[90] flex max-w-sm flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded-md bg-black-700 px-3 py-2 text-sm text-white shadow-md"
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
