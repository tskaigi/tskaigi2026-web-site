"use client";

import { X } from "lucide-react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import { Button } from "@/components/ui/button";

type TourCardProps = CardComponentProps & {
  /** 「次へ」ボタンの代わりに表示する操作案内テキスト */
  instructionText?: string;
  /** step.content を上書きするテキスト */
  contentOverride?: string;
};

export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
  instructionText,
  contentOverride,
}: TourCardProps) {
  const { closeOnborda } = useOnborda();
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const isDialog = step.selector === "#tour-dialog";

  return (
    <div
      className={`relative rounded-xl bg-white p-4 shadow-xl border border-black-200 flex flex-col max-h-[85vh] ${
        isDialog
          ? "w-[min(480px,calc(100vw-32px))]"
          : "w-[min(300px,calc(100vw-32px))]"
      }`}
    >
      <button
        type="button"
        className="absolute right-3 top-3 text-black-400 hover:text-black-700 cursor-pointer"
        onClick={closeOnborda}
        aria-label="ツアーを閉じる"
      >
        <X size={16} />
      </button>

      {step.icon && (
        <div className="text-2xl mb-1 text-blue-light-500">{step.icon}</div>
      )}
      <h3 className="text-base font-bold text-black-700 pr-6">{step.title}</h3>
      <p className="mt-1 text-xs text-black-400">
        {currentStep + 1} / {totalSteps}
      </p>
      <div className="mt-2 text-sm text-black-600 leading-relaxed flex-1 min-h-0 overflow-y-auto">
        {contentOverride ?? step.content}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {instructionText ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={isFirst ? closeOnborda : prevStep}
            >
              {isFirst ? "スキップ" : "戻る"}
            </Button>
            <span className="text-xs text-black-400">{instructionText}</span>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={isFirst ? closeOnborda : prevStep}
            >
              {isFirst ? "スキップ" : "戻る"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={isLast ? closeOnborda : nextStep}
            >
              {isLast ? "完了" : "次へ"}
            </Button>
          </>
        )}
      </div>

      {arrow}
    </div>
  );
}
