"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOnborda } from "onborda";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { myTimetableIds } from "@/utils/myTimetable/ids";
import { TourCard } from "./TourCard";
import { useTourStepState } from "./TourProvider";
import { stepMeta, tourDefinition } from "./tourSteps";

type PointerPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function getElementPosition(element: Element): PointerPosition {
  const { top, left, width, height } = element.getBoundingClientRect();
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  return { x: left + scrollLeft, y: top + scrollTop, width, height };
}

/** 同じセレクタの要素が複数ある場合、表示されている方を返す */
function findVisibleElement(selector: string): Element | null {
  const elements = document.querySelectorAll(selector);
  for (const el of elements) {
    if (el instanceof HTMLElement && el.offsetParent !== null) {
      return el;
    }
  }
  // フォールバック: 最初の要素を返す
  return elements[0] ?? null;
}

function getCardStyle(side: string | undefined) {
  switch (side) {
    case "top":
      return {
        transform: "translate(-50%, 0)",
        left: "50%",
        bottom: "100%",
        marginBottom: "25px",
      };
    case "bottom":
      return {
        transform: "translate(-50%, 0)",
        left: "50%",
        top: "100%",
        marginTop: "25px",
      };
    case "left":
      return {
        transform: "translate(0, -50%)",
        right: "100%",
        top: "50%",
        marginRight: "25px",
      };
    case "right":
      return {
        transform: "translate(0, -50%)",
        left: "100%",
        top: "50%",
        marginLeft: "25px",
      };
    case "top-left":
      return { bottom: "100%", marginBottom: "25px" };
    case "top-right":
      return { right: "0", bottom: "100%", marginBottom: "25px" };
    case "bottom-left":
      return { top: "100%", marginTop: "25px" };
    case "bottom-right":
      return { right: "0", top: "100%", marginTop: "25px" };
    case "right-bottom":
      return { left: "100%", bottom: "0", marginLeft: "25px" };
    case "right-top":
      return { left: "100%", top: "0", marginLeft: "25px" };
    case "left-bottom":
      return { right: "100%", bottom: "0", marginRight: "25px" };
    case "left-top":
      return { right: "100%", top: "0", marginRight: "25px" };
    default:
      return {};
  }
}

function getArrowStyle(side: string | undefined): React.CSSProperties {
  switch (side) {
    case "bottom":
      return {
        transform: "translate(-50%, 0) rotate(270deg)",
        left: "50%",
        top: "-23px",
      };
    case "top":
      return {
        transform: "translate(-50%, 0) rotate(90deg)",
        left: "50%",
        bottom: "-23px",
      };
    case "right":
      return {
        transform: "translate(0, -50%) rotate(180deg)",
        top: "50%",
        left: "-23px",
      };
    case "left":
      return {
        transform: "translate(0, -50%) rotate(0deg)",
        top: "50%",
        right: "-23px",
      };
    case "top-left":
      return { transform: "rotate(90deg)", left: "10px", bottom: "-23px" };
    case "top-right":
      return { transform: "rotate(90deg)", right: "10px", bottom: "-23px" };
    case "bottom-left":
      return { transform: "rotate(270deg)", left: "10px", top: "-23px" };
    case "bottom-right":
      return { transform: "rotate(270deg)", right: "10px", top: "-23px" };
    case "right-bottom":
      return { transform: "rotate(180deg)", left: "-23px", bottom: "10px" };
    case "right-top":
      return { transform: "rotate(180deg)", left: "-23px", top: "10px" };
    case "left-bottom":
      return { transform: "rotate(0deg)", right: "-23px", bottom: "10px" };
    case "left-top":
      return { transform: "rotate(0deg)", right: "-23px", top: "10px" };
    default:
      return {};
  }
}

function CardArrow({ side }: { side: string | undefined }) {
  return (
    <svg
      viewBox="0 0 54 54"
      className="absolute w-6 h-6 origin-center text-white"
      style={getArrowStyle(side)}
      role="img"
      aria-label="arrow"
    >
      <path d="M27 27L0 0V54L27 27Z" fill="currentColor" />
    </svg>
  );
}

export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentTour,
    currentStep,
    setCurrentStep,
    closeOnborda,
    isOnbordaVisible,
  } = useOnborda();
  const { addedTalkId, setAddedTalkId } = useTourStepState();

  const steps = tourDefinition.find((t) => t.tour === currentTour)?.steps;
  const meta = stepMeta[currentStep];
  const rawBehaviorType = meta?.behavior.type ?? "default";

  // Step 0: 対象セッションが既に追加済みなら passthrough-add → default に切り替え
  // Step 4: addedTalkId がタイムテーブルにないなら passthrough-delete → default に切り替え
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [deleteTargetMissing, setDeleteTargetMissing] = useState(false);

  useEffect(() => {
    if (!isOnbordaVisible) {
      setAlreadyAdded(false);
      setDeleteTargetMissing(false);
      return;
    }
    if (rawBehaviorType === "passthrough-add") {
      // #tour-add-button 内の talkId を取得して追加済みかチェック
      const el = findVisibleElement("#tour-add-button");
      if (el) {
        const btn = el.querySelector("[data-talk-id]");
        if (btn instanceof HTMLElement) {
          const talkId = btn.dataset.talkId;
          if (talkId && myTimetableIds.read().includes(talkId)) {
            setAlreadyAdded(true);
            setAddedTalkId(talkId);
            return;
          }
        }
      }
      setAlreadyAdded(false);
    } else if (rawBehaviorType === "passthrough-delete") {
      if (!addedTalkId || !myTimetableIds.read().includes(addedTalkId)) {
        setDeleteTargetMissing(true);
      } else {
        setDeleteTargetMissing(false);
      }
    } else {
      setAlreadyAdded(false);
      setDeleteTargetMissing(false);
    }
  }, [isOnbordaVisible, rawBehaviorType, addedTalkId, setAddedTalkId]);

  const behaviorType = useMemo(() => {
    if (rawBehaviorType === "passthrough-add" && alreadyAdded) return "default";
    if (rawBehaviorType === "passthrough-delete" && deleteTargetMissing)
      return "default";
    return rawBehaviorType;
  }, [rawBehaviorType, alreadyAdded, deleteTargetMissing]);

  // 上書き時のカード内容テキスト
  const contentOverride = useMemo(() => {
    if (rawBehaviorType === "passthrough-add" && alreadyAdded) {
      return "このセッションは既にマイタイムテーブルに追加されています。「次へ」を押して進みましょう。";
    }
    if (rawBehaviorType === "passthrough-delete" && deleteTargetMissing) {
      return "削除対象のセッションがマイタイムテーブルにありません。「次へ」を押して進みましょう。";
    }
    return undefined;
  }, [rawBehaviorType, alreadyAdded, deleteTargetMissing]);

  // 動的セレクタ: stepMeta に dynamicSelector がある場合はそちらを使用
  const resolveSelector = useCallback(
    (stepIndex: number, fallbackSelector: string) => {
      const m = stepMeta[stepIndex];
      if (m?.dynamicSelector) {
        return m.dynamicSelector(addedTalkId);
      }
      return fallbackSelector;
    },
    [addedTalkId],
  );

  const [position, setPosition] = useState<PointerPosition | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const currentSelector = steps?.[currentStep]
    ? resolveSelector(currentStep, steps[currentStep].selector)
    : null;

  /** スポットライト位置の更新のみ（スクロールしない） */
  const syncPosition = useCallback(() => {
    if (!currentSelector) return;
    const el = findVisibleElement(currentSelector);
    if (el) {
      setPosition(getElementPosition(el));
    }
  }, [currentSelector]);

  /** ステップ切り替え時に呼ぶ: 位置更新 + カードが見えるようスクロール */
  const updatePositionAndScroll = useCallback(() => {
    if (!currentSelector || !steps) return;
    const step = steps[currentStep];
    if (!step) return;
    const el = findVisibleElement(currentSelector);
    if (el) {
      setPosition(getElementPosition(el));
      const rect = el.getBoundingClientRect();
      const side = step.side ?? "bottom";
      const cardHeight = 250;
      const margin = 30;

      const isCardAbove =
        side.startsWith("top") || side === "left-top" || side === "right-top";

      if (isCardAbove) {
        const cardTop = rect.top - cardHeight;
        if (cardTop < 0 || rect.top > window.innerHeight) {
          const target = window.scrollY + rect.top - cardHeight - margin;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
      } else {
        const needed = rect.top + cardHeight;
        if (rect.top < 0 || needed > window.innerHeight) {
          const target = window.scrollY + rect.top - margin;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
      }
    }
  }, [currentSelector, steps, currentStep]);

  // 要素が見つからない場合に MutationObserver で待機
  const waitForElementRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!isOnbordaVisible || !steps) {
      setPosition(null);
      waitForElementRef.current?.disconnect();
      return;
    }

    const step = steps[currentStep];
    if (!step) return;

    // ダイアログモードは DOM 要素不要
    if (step.selector === "#tour-dialog") return;

    const selector = resolveSelector(currentStep, step.selector);
    const el = findVisibleElement(selector);
    if (el) {
      updatePositionAndScroll();
    } else {
      // 要素がまだ DOM にない → MutationObserver で待つ
      waitForElementRef.current?.disconnect();
      const observer = new MutationObserver(() => {
        const found = findVisibleElement(selector);
        if (found) {
          observer.disconnect();
          updatePositionAndScroll();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      waitForElementRef.current = observer;
    }

    return () => waitForElementRef.current?.disconnect();
  }, [
    isOnbordaVisible,
    steps,
    currentStep,
    updatePositionAndScroll,
    resolveSelector,
  ]);

  useEffect(() => {
    if (!isOnbordaVisible) return;
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition);
    return () => {
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition);
    };
  }, [isOnbordaVisible, syncPosition]);

  const navigateAndWait = useCallback(
    (route: string, selector: string, stepIndex: number) => {
      router.push(route);
      observerRef.current?.disconnect();
      const observer = new MutationObserver(() => {
        const el = findVisibleElement(selector);
        if (el) {
          observer.disconnect();
          setCurrentStep(stepIndex);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      observerRef.current = observer;
    },
    [router, setCurrentStep],
  );

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // ツアー開始時に addedTalkId をリセット
  const prevVisible = useRef(false);
  useEffect(() => {
    if (isOnbordaVisible && !prevVisible.current) {
      setAddedTalkId(null);
    }
    prevVisible.current = isOnbordaVisible;
  }, [isOnbordaVisible, setAddedTalkId]);

  // passthrough-add / passthrough-delete: my-timetable-updated で自動進行
  useEffect(() => {
    if (!isOnbordaVisible || !steps) return;
    if (
      behaviorType !== "passthrough-add" &&
      behaviorType !== "passthrough-delete"
    )
      return;

    const handler = () => {
      const nextIdx = currentStep + 1;
      if (nextIdx < steps.length) {
        // passthrough-add: addedTalkId をセット
        if (behaviorType === "passthrough-add") {
          // #tour-add-button 内の最初のセッションIDを取得
          const el = findVisibleElement("#tour-add-button");
          if (el) {
            const btn = el.querySelector("[data-talk-id]");
            if (btn instanceof HTMLElement) {
              setAddedTalkId(btn.dataset.talkId ?? null);
            }
          }
        }

        const nextSelector = steps[nextIdx].selector;
        if (nextSelector === "#tour-dialog") {
          setCurrentStep(nextIdx);
          return;
        }
        const nextEl = findVisibleElement(
          resolveSelector(nextIdx, nextSelector),
        );
        if (nextEl) {
          setCurrentStep(nextIdx);
        } else {
          const route = steps[currentStep]?.nextRoute;
          if (route) {
            navigateAndWait(
              route,
              resolveSelector(nextIdx, nextSelector),
              nextIdx,
            );
          }
        }
      }
    };

    window.addEventListener("my-timetable-updated", handler);
    return () => window.removeEventListener("my-timetable-updated", handler);
  }, [
    isOnbordaVisible,
    steps,
    currentStep,
    behaviorType,
    resolveSelector,
    setCurrentStep,
    setAddedTalkId,
    navigateAndWait,
  ]);

  // passthrough-click: ルート遷移で自動進行
  useEffect(() => {
    if (!isOnbordaVisible || !steps) return;
    if (behaviorType !== "passthrough-click") return;

    const currentStepDef = steps[currentStep];
    if (!currentStepDef?.nextRoute) return;
    const targetRoute = currentStepDef.nextRoute;

    // 現在のルートがターゲットに変わったら進行
    if (pathname === targetRoute || pathname.startsWith(`${targetRoute}?`)) {
      const nextIdx = currentStep + 1;
      if (nextIdx >= steps.length) return;
      const nextSelector = resolveSelector(nextIdx, steps[nextIdx].selector);

      const found = findVisibleElement(nextSelector);
      if (found) {
        setCurrentStep(nextIdx);
      } else {
        // DOM にまだないので Observer で待つ
        const observer = new MutationObserver(() => {
          const el = findVisibleElement(nextSelector);
          if (el) {
            observer.disconnect();
            setCurrentStep(nextIdx);
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        observerRef.current = observer;
      }
    }
  }, [
    isOnbordaVisible,
    steps,
    currentStep,
    behaviorType,
    pathname,
    resolveSelector,
    setCurrentStep,
  ]);

  if (!isOnbordaVisible || !steps) return null;

  const step = steps[currentStep];
  if (!step) return null;

  const isDialogMode = step.selector === "#tour-dialog";

  // position が必要なステップで null なら待機中
  if (!isDialogMode && !position) return null;

  const padding = step.pointerPadding ?? 30;
  const padOffset = padding / 2;
  const radius = step.pointerRadius ?? 28;

  // passthrough 系は pointerEvents を none にしてクリック透過
  const isPassthrough =
    behaviorType === "passthrough-add" ||
    behaviorType === "passthrough-click" ||
    behaviorType === "passthrough-delete";

  // passthrough 系のインストラクションテキスト
  const instructionText = isPassthrough ? "操作してみましょう" : undefined;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      const nextSelector = resolveSelector(nextIdx, steps[nextIdx].selector);
      // ダイアログモードは DOM 要素不要
      if (steps[nextIdx].selector === "#tour-dialog") {
        setCurrentStep(nextIdx);
        return;
      }
      const route = step.nextRoute;
      if (route) {
        const nextEl = findVisibleElement(nextSelector);
        if (nextEl) {
          setCurrentStep(nextIdx);
        } else {
          navigateAndWait(route, nextSelector, nextIdx);
        }
      } else {
        setCurrentStep(nextIdx);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      const prevSelector = resolveSelector(prevIdx, steps[prevIdx].selector);
      // ダイアログモードは DOM 要素不要
      if (steps[prevIdx].selector === "#tour-dialog") {
        setCurrentStep(prevIdx);
        return;
      }
      const route = step.prevRoute;
      if (route) {
        const prevEl = findVisibleElement(prevSelector);
        if (prevEl) {
          setCurrentStep(prevIdx);
        } else {
          navigateAndWait(route, prevSelector, prevIdx);
        }
      } else {
        setCurrentStep(prevIdx);
      }
    }
  };

  const cardProps = {
    step,
    currentStep,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    instructionText,
    contentOverride,
    arrow: isDialogMode ? (
      <span className="hidden" />
    ) : (
      <CardArrow side={step.side} />
    ),
  };

  // ダイアログモード: ポインターなし、中央表示
  if (isDialogMode) {
    return createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[900] cursor-default bg-black/50"
          onClick={closeOnborda}
          aria-label="ツアーを閉じる"
        />
        <div className="fixed inset-0 z-[950] flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto">
            <TourCard {...cardProps} />
          </div>
        </div>
      </>,
      document.body,
    );
  }

  // position は isDialogMode でない && null チェック済み
  if (!position) return null;
  const pos = position;

  return createPortal(
    <>
      {/* Clickable backdrop to close (passthrough 時は無効化) */}
      <button
        type="button"
        className="fixed inset-0 z-[900] cursor-default"
        onClick={isPassthrough ? undefined : closeOnborda}
        style={{ pointerEvents: isPassthrough ? "none" : "auto" }}
        aria-label="ツアーを閉じる"
      />

      {/* Pointer highlight + card */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: tour backdrop */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: tour backdrop */}
      <div
        onClick={isPassthrough ? undefined : closeOnborda}
        className="absolute z-[900] transition-all duration-500 ease-out"
        style={{
          left: `${pos.x - padOffset}px`,
          top: `${pos.y - padOffset}px`,
          width: `${pos.width + padding}px`,
          height: `${pos.height + padding}px`,
          boxShadow: "0 0 200vw 200vh rgba(0, 0, 0, 0.5)",
          borderRadius: `${radius}px`,
          pointerEvents: isPassthrough ? "none" : "auto",
        }}
      >
        {/* Card */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute flex flex-col max-w-full min-w-min pointer-events-auto z-[950]"
          style={getCardStyle(step.side)}
        >
          <TourCard {...cardProps} />
        </div>
      </div>
    </>,
    document.body,
  );
}
