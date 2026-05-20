"use client";

import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";

type QrTab = "sync" | "share";

export function MyTimetableQrDialog({
  currentShareUrl,
  yourShareUrl,
  onClose,
}: {
  currentShareUrl: string;
  yourShareUrl: string;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<QrTab>("sync");

  const tabs: { key: QrTab; label: string }[] = [
    { key: "sync", label: "同期用" },
    { key: "share", label: "共有用" },
  ];

  const qrUrl = activeTab === "sync" ? currentShareUrl : yourShareUrl;
  const description =
    activeTab === "sync"
      ? "読み取った端末に保存されているマイタイムテーブル情報が上書きされます"
      : "読み取った端末に保存されているマイタイムテーブル情報は上書きされません";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 p-4 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0"
        onClick={onClose}
        aria-label="ダイアログを閉じる"
      />
      <section
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-sm rounded-xl bg-white p-4 md:p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-black-700">QRコード</h3>
          <button
            type="button"
            className="text-black-500 hover:text-black-700 cursor-pointer"
            onClick={onClose}
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 w-full flex justify-center">
          <div className="inline-flex rounded-lg overflow-hidden">
            {tabs.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2 text-base font-medium ${!isActive ? "cursor-pointer" : ""} ${
                    isActive
                      ? "bg-blue-light-500 text-white"
                      : "bg-white text-blue-light-500"
                  } ${
                    tab.key === "sync"
                      ? "border-y border-l border-blue-light-500 rounded-l-lg"
                      : "border-y border-r border-blue-light-500 rounded-r-lg"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          {qrUrl.length > 0 && (
            <QRCodeSVG
              value={qrUrl}
              size={200}
              aria-label={`${activeTab === "sync" ? "同期" : "共有"}用QRコード`}
            />
          )}
          <p className="mt-3 text-xs text-black-500 text-center">
            {description}
          </p>
        </div>
      </section>
    </div>
  );
}
