"use client";

import { usePathname, useRouter } from "next/navigation";
import { useOnborda } from "onborda";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type CardSize = {
  width: number;
  height: number;
};

type PlacementSide = "top" | "bottom" | "left" | "right";

type CardPlacement = {
  left: number;
  top: number;
  side: PlacementSide;
  arrowOffset: number;
};

const CARD_GAP = 25;
const VIEWPORT_MARGIN = 16;
const HEADER_HEIGHT = 68;
const FALLBACK_CARD_SIZE: CardSize = { width: 300, height: 220 };

function clamp(value: number, min: number, max: number) {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

function getPrimarySide(side: string | undefined): PlacementSide {
  if (side?.startsWith("top")) return "top";
  if (side?.startsWith("left")) return "left";
  if (side?.startsWith("right")) return "right";
  return "bottom";
}

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

function getCardPlacement(
  position: PointerPosition,
  side: string | undefined,
  cardSize: CardSize,
): CardPlacement {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  const target = {
    left: position.x - scrollLeft,
    top: position.y - scrollTop,
    right: position.x - scrollLeft + position.width,
    bottom: position.y - scrollTop + position.height,
  };
  const targetCenterX = target.left + position.width / 2;
  const targetCenterY = target.top + position.height / 2;

  const space = {
    top: target.top - VIEWPORT_MARGIN - HEADER_HEIGHT,
    bottom: viewportHeight - target.bottom - VIEWPORT_MARGIN,
    left: target.left - VIEWPORT_MARGIN,
    right: viewportWidth - target.right - VIEWPORT_MARGIN,
  };

  let placementSide = getPrimarySide(side);
  const needsHorizontalFallback =
    (placementSide === "left" || placementSide === "right") &&
    space[placementSide] < cardSize.width + CARD_GAP;

  if (needsHorizontalFallback) {
    placementSide = space.bottom >= space.top ? "bottom" : "top";
  } else if (
    placementSide === "top" &&
    space.top < cardSize.height + CARD_GAP &&
    space.bottom > space.top
  ) {
    placementSide = "bottom";
  } else if (
    placementSide === "bottom" &&
    space.bottom < cardSize.height + CARD_GAP &&
    space.top > space.bottom
  ) {
    placementSide = "top";
  } else if (
    placementSide === "left" &&
    space.left < cardSize.width + CARD_GAP &&
    space.right > space.left
  ) {
    placementSide = "right";
  } else if (
    placementSide === "right" &&
    space.right < cardSize.width + CARD_GAP &&
    space.left > space.right
  ) {
    placementSide = "left";
  }

  const maxLeft = viewportWidth - cardSize.width - VIEWPORT_MARGIN;
  const maxTop = viewportHeight - cardSize.height - VIEWPORT_MARGIN;
  let left = targetCenterX - cardSize.width / 2;
  let top = target.bottom + CARD_GAP;

  if (placementSide === "top") {
    top = target.top - cardSize.height - CARD_GAP;
  } else if (placementSide === "left") {
    left = target.left - cardSize.width - CARD_GAP;
    top = targetCenterY - cardSize.height / 2;
  } else if (placementSide === "right") {
    left = target.right + CARD_GAP;
    top = targetCenterY - cardSize.height / 2;
  }

  const clampedLeft = clamp(left, VIEWPORT_MARGIN, maxLeft);
  const clampedTop = clamp(top, VIEWPORT_MARGIN + HEADER_HEIGHT, maxTop);
  const rawArrowOffset =
    placementSide === "top" || placementSide === "bottom"
      ? targetCenterX - clampedLeft
      : targetCenterY - clampedTop;
  const arrowOffset = clamp(
    rawArrowOffset,
    18,
    (placementSide === "top" || placementSide === "bottom"
      ? cardSize.width
      : cardSize.height) - 18,
  );

  return {
    left: clampedLeft + scrollLeft,
    top: clampedTop + scrollTop,
    side: placementSide,
    arrowOffset,
  };
}

function getArrowStyle(
  side: PlacementSide,
  arrowOffset: number,
): React.CSSProperties {
  switch (side) {
    case "bottom":
      return {
        transform: "translate(-50%, 0) rotate(270deg)",
        left: `${arrowOffset}px`,
        top: "-23px",
      };
    case "top":
      return {
        transform: "translate(-50%, 0) rotate(90deg)",
        left: `${arrowOffset}px`,
        bottom: "-23px",
      };
    case "right":
      return {
        transform: "translate(0, -50%) rotate(180deg)",
        top: `${arrowOffset}px`,
        left: "-23px",
      };
    case "left":
      return {
        transform: "translate(0, -50%) rotate(0deg)",
        top: `${arrowOffset}px`,
        right: "-23px",
      };
  }
}

function CardArrow({
  side,
  arrowOffset,
}: {
  side: PlacementSide;
  arrowOffset: number;
}) {
  return (
    <svg
      viewBox="0 0 54 54"
      className="absolute w-6 h-6 origin-center text-white"
      style={getArrowStyle(side, arrowOffset)}
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
    } else if (rawBehaviorType === "passthrough-drawer-open") {
      if (!addedTalkId) {
        const ids = myTimetableIds.read();
        if (ids.length > 0) {
          setAddedTalkId(ids[0]);
        }
      }
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
  const [cardSize, setCardSize] = useState<CardSize>(FALLBACK_CARD_SIZE);
  const cardRef = useRef<HTMLDivElement | null>(null);
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
      const nextPosition = getElementPosition(el);
      setPosition(nextPosition);
      const rect = el.getBoundingClientRect();
      const side = getPrimarySide(step.side);
      const estimatedCardHeight = cardSize.height || FALLBACK_CARD_SIZE.height;
      const margin = VIEWPORT_MARGIN + CARD_GAP + HEADER_HEIGHT;
      const shouldPreferAbove =
        side === "top" ||
        (side !== "bottom" && rect.top > window.innerHeight - rect.bottom);

      if (shouldPreferAbove) {
        const cardTop = rect.top - estimatedCardHeight - CARD_GAP;
        if (cardTop < HEADER_HEIGHT || rect.top > window.innerHeight) {
          const target =
            window.scrollY + rect.top - estimatedCardHeight - margin;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
      } else {
        const cardBottom = rect.bottom + CARD_GAP + estimatedCardHeight;
        if (rect.top < HEADER_HEIGHT || cardBottom > window.innerHeight) {
          const target = window.scrollY + rect.top - margin;
          window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        }
      }
    }
  }, [currentSelector, steps, currentStep, cardSize.height]);

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

    // ドロワー等のスライドインアニメーション中は rect が動くので、
    // 安定するまで rAF で追従する（タイムアウト付き）
    let rafId: number | null = null;
    const startPositionPoll = () => {
      const POLL_TIMEOUT_MS = 1000;
      const STABLE_FRAMES_NEEDED = 5;
      let lastPos: PointerPosition | null = null;
      let stableFrames = 0;
      const startedAt = performance.now();

      const tick = () => {
        const target = findVisibleElement(selector);
        if (target) {
          const next = getElementPosition(target);
          const changed =
            !lastPos ||
            Math.abs(lastPos.x - next.x) > 0.5 ||
            Math.abs(lastPos.y - next.y) > 0.5 ||
            Math.abs(lastPos.width - next.width) > 0.5 ||
            Math.abs(lastPos.height - next.height) > 0.5;
          if (changed) {
            setPosition(next);
            stableFrames = 0;
          } else {
            stableFrames++;
          }
          lastPos = next;
          if (stableFrames >= STABLE_FRAMES_NEEDED) return;
        }
        if (performance.now() - startedAt > POLL_TIMEOUT_MS) return;
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const el = findVisibleElement(selector);
    if (el) {
      updatePositionAndScroll();
      startPositionPoll();
    } else {
      // 要素がまだ DOM にない → MutationObserver で待つ
      waitForElementRef.current?.disconnect();
      const observer = new MutationObserver(() => {
        const found = findVisibleElement(selector);
        if (found) {
          observer.disconnect();
          updatePositionAndScroll();
          startPositionPoll();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      waitForElementRef.current = observer;
    }

    return () => {
      waitForElementRef.current?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
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

  // ツアー開始時に addedTalkId をリセット（既に追加済みならそのIDをセット）
  const prevVisible = useRef(false);
  useEffect(() => {
    if (isOnbordaVisible && !prevVisible.current) {
      const el = findVisibleElement("#tour-add-button");
      if (el) {
        const btn = el.querySelector("[data-talk-id]");
        if (btn instanceof HTMLElement) {
          const talkId = btn.dataset.talkId;
          if (talkId && myTimetableIds.read().includes(talkId)) {
            setAddedTalkId(talkId);
            prevVisible.current = isOnbordaVisible;
            return;
          }
        }
      }
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

  // passthrough-drawer-open: ドロワーが開いたら（#tour-drawer-participate が出現したら）自動進行
  useEffect(() => {
    if (!isOnbordaVisible || !steps) return;
    if (behaviorType !== "passthrough-drawer-open") return;

    const nextIdx = currentStep + 1;
    if (nextIdx >= steps.length) return;

    const check = () => {
      const el = findVisibleElement("#tour-drawer-participate");
      if (el) {
        setCurrentStep(nextIdx);
        return true;
      }
      return false;
    };

    if (check()) return;

    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isOnbordaVisible, steps, currentStep, behaviorType, setCurrentStep]);

  // passthrough-participate: 参加記録イベントで自動進行＆ドロワーを閉じる
  useEffect(() => {
    if (!isOnbordaVisible || !steps) return;
    if (behaviorType !== "passthrough-participate") return;

    const handler = () => {
      const nextIdx = currentStep + 1;
      if (nextIdx >= steps.length) return;

      // ドロワーを閉じるためにEscapeキーをディスパッチ
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );

      const nextSelector = resolveSelector(nextIdx, steps[nextIdx].selector);
      const nextEl = findVisibleElement(nextSelector);
      if (nextEl) {
        setCurrentStep(nextIdx);
      } else {
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

  const renderedStep = steps?.[currentStep];
  const renderedIsDialogMode = renderedStep?.selector === "#tour-dialog";

  useLayoutEffect(() => {
    if (!isOnbordaVisible || renderedIsDialogMode) return;
    const card = cardRef.current;
    if (!card) return;

    const updateCardSize = () => {
      const { width, height } = card.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      setCardSize((current) => {
        if (
          Math.abs(current.width - width) < 1 &&
          Math.abs(current.height - height) < 1
        ) {
          return current;
        }
        return { width, height };
      });
    };

    updateCardSize();
    const observer = new ResizeObserver(updateCardSize);
    observer.observe(card);
    return () => observer.disconnect();
  }, [isOnbordaVisible, renderedIsDialogMode]);

  if (!isOnbordaVisible || !steps) return null;

  const step = renderedStep;
  if (!step) return null;

  const isDialogMode = renderedIsDialogMode;

  // position が必要なステップで null なら待機中
  if (!isDialogMode && !position) return null;

  const padding = step.pointerPadding ?? 30;
  const padOffset = padding / 2;
  const radius = step.pointerRadius ?? 28;

  // passthrough 系は pointerEvents を none にしてクリック透過
  const isPassthrough =
    behaviorType === "passthrough-add" ||
    behaviorType === "passthrough-click" ||
    behaviorType === "passthrough-delete" ||
    behaviorType === "passthrough-drawer-open" ||
    behaviorType === "passthrough-participate";

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

  const placement =
    !isDialogMode && position
      ? getCardPlacement(position, step.side, cardSize)
      : null;

  const cardProps = {
    step,
    currentStep,
    totalSteps: steps.length,
    nextStep,
    prevStep,
    instructionText,
    contentOverride,
    arrow:
      isDialogMode || !placement ? (
        <span className="hidden" />
      ) : (
        <CardArrow side={placement.side} arrowOffset={placement.arrowOffset} />
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
  if (!placement) return null;

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
      ></div>

      {/* Card */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: stop propagation */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stop propagation */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="absolute z-[950] flex flex-col pointer-events-auto transition-[left,top] duration-500 ease-out"
        style={{
          left: `${placement.left}px`,
          top: `${placement.top}px`,
        }}
      >
        <TourCard {...cardProps} />
      </div>
    </>,
    document.body,
  );
}
