import type { Step } from "onborda";

type Tour = {
  tour: string;
  steps: Step[];
};

export type TourStepBehavior =
  | { type: "default" }
  | { type: "passthrough-add" }
  | { type: "passthrough-click" }
  | { type: "passthrough-delete" };

export type TourStepMeta = {
  behavior: TourStepBehavior;
  /** 追加セッションIDから動的にセレクタを算出する */
  dynamicSelector?: (addedTalkId: string | null) => string;
};

/**
 * ステップごとのカスタム動作定義（index をキーに）
 * - passthrough-add: ハイライト要素のクリック透過、追加イベントで自動進行
 * - passthrough-click: ハイライト要素のクリック透過、ルート遷移で自動進行
 * - passthrough-delete: ハイライト要素のクリック透過、削除イベントで自動進行
 */
export const stepMeta: Partial<Record<number, TourStepMeta>> = {
  0: { behavior: { type: "passthrough-add" } },
  1: { behavior: { type: "passthrough-click" } },
  4: {
    behavior: { type: "passthrough-delete" },
    dynamicSelector: (addedTalkId) =>
      addedTalkId
        ? `[data-tour-session-id="${addedTalkId}"]`
        : "#tour-timeline-day1",
  },
};

const steps: Step[] = [
  // Step 1: /talks — セッションセル（追加ボタン付き）
  {
    icon: "1️⃣",
    title: "セッションを追加してみよう",
    content:
      "セッションの「追加」ボタンを押して、マイタイムテーブルに追加してみましょう。",
    selector: "#tour-add-button",
    side: "bottom",
    showControls: true,
    pointerPadding: 8,
    pointerRadius: 8,
    nextRoute: "/talks",
    prevRoute: "/talks",
  },
  // Step 2: /talks — Floating button（クリックで遷移）
  {
    icon: "2️⃣",
    title: "マイタイムテーブルへ移動",
    content: "右下のボタンをタップしてマイタイムテーブルに移動しましょう。",
    selector: "#tour-floating-button",
    side: "left-bottom",
    showControls: true,
    pointerPadding: 8,
    pointerRadius: 24,
    nextRoute: "/talks/me",
    prevRoute: "/talks",
  },
  // Step 3: /talks/me — Search panel
  {
    icon: "3️⃣",
    title: "検索から追加",
    content: "タイトルやスピーカー名で検索して、セッションを追加できます。",
    selector: "#tour-search-panel",
    side: "bottom-left",
    showControls: true,
    pointerPadding: 8,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks",
  },
  // Step 4: /talks/me — Timeline background click
  {
    icon: "4️⃣",
    title: "タイムラインから追加",
    content:
      "タイムラインの空いている時間帯をクリックすると、その時間のセッション一覧が表示されます。そこからも追加できます。",
    selector: "#tour-timeline-day1",
    side: "top",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 12,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 5: /talks/me — Remove talk（追加したセッションを削除）
  {
    icon: "5️⃣",
    title: "セッションを削除",
    content:
      "追加したセッションの右上の × をタップして削除してみましょう。検索パネルからも削除可能です。",
    selector: "#tour-timeline-day1",
    side: "top",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 12,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 6: /talks/me — Share button
  {
    icon: "6️⃣",
    title: "Xでシェア",
    content:
      "マイタイムテーブルをXでシェアできます。タイムテーブルのURLが共有されるので、友人と予定を共有しましょう。",
    selector: "#tour-sidebar-share",
    side: "right",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 7: /talks/me — QR code button
  {
    icon: "7️⃣",
    title: "QRコード",
    content:
      "QRコードを表示して、他のデバイスでマイタイムテーブルを開けます。スマホとPCで同期しましょう。",
    selector: "#tour-sidebar-qr",
    side: "right",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 8: /talks/me — Info button
  {
    icon: "8️⃣",
    title: "マイタイムテーブルについて",
    content: "マイタイムテーブルの使い方や機能の説明を確認できます。",
    selector: "#tour-sidebar-info",
    side: "right",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 9: /talks/me — Reset button
  {
    icon: "9️⃣",
    title: "リセット",
    content: "追加したセッションをすべてクリアして、最初からやり直せます。",
    selector: "#tour-reset-button",
    side: "bottom-right",
    showControls: true,
    pointerPadding: 8,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 10: Final message (dialog mode — no highlight target)
  {
    icon: "🎉",
    title: "全時間参加を目指そう！",
    content:
      "会場では各セッションの参加記録QRコードが掲出されます。読み取ると参加記録がつきます。全時間帯のセッションに参加して、コンプリートを目指しましょう！",
    selector: "#tour-dialog",
    side: "bottom",
    showControls: true,
    pointerPadding: 0,
    pointerRadius: 0,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
];

export const tourDefinition: Tour[] = [
  {
    tour: "my-timetable",
    steps,
  },
];
