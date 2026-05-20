import type { Step } from "onborda";

type Tour = {
  tour: string;
  steps: Step[];
};

export type TourStepBehavior =
  | { type: "default" }
  | { type: "passthrough-add" }
  | { type: "passthrough-click" }
  | { type: "passthrough-delete" }
  | { type: "passthrough-drawer-open" }
  | { type: "passthrough-participate" };

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
  1: { behavior: { type: "passthrough-add" } },
  2: { behavior: { type: "passthrough-click" } },
  5: {
    behavior: { type: "passthrough-drawer-open" },
    dynamicSelector: (addedTalkId) =>
      addedTalkId
        ? `[data-tour-session-id="${addedTalkId}"]`
        : "[data-tour-session-id]",
  },
  6: { behavior: { type: "passthrough-participate" } },
  7: {
    behavior: { type: "passthrough-delete" },
    dynamicSelector: (addedTalkId) =>
      addedTalkId
        ? `[data-tour-session-id="${addedTalkId}"]`
        : "[data-tour-session-id]",
  },
};

function IntroContent() {
  return (
    <div className="flex flex-col gap-3">
      <p>
        マイタイムテーブルは、TSKaigi
        2026で聴きたいセッションを自分だけのスケジュールとして管理できる機能です。
      </p>
      <div>
        <p className="font-bold text-black-700">スケジュールを組もう</p>
        <p className="mt-1">
          気になるセッションを検索して追加し、自分だけのタイムテーブルを作成できます。タイムライン上の時間帯をタップして追加することもできます。
        </p>
      </div>
      <div>
        <p className="font-bold text-black-700">参加記録を残そう</p>
        <p className="mt-1">
          各セッションの詳細画面から参加記録を付けることができます。目指せ、行きたい全セッション踏破！
        </p>
      </div>
      <div>
        <p className="font-bold text-black-700">共有して会話のタネに</p>
        <p className="mt-1">
          QRコードやSNSでマイタイムテーブルを共有できます。会場内や懇親会で「こんなセッション聴いたよ！」と見せ合って、会話のきっかけにしましょう。
        </p>
      </div>
      <div>
        <p className="font-bold text-black-700">PC・スマホ間の同期</p>
        <p className="mt-1">
          事前にPCでスケジュールを組んで、QRコードでスマホに同期して会場に持っていくこともできます。
        </p>
      </div>
    </div>
  );
}

const steps: Step[] = [
  // Step 0: イントロダイアログ（マイタイムテーブルとは？）
  {
    icon: "✨",
    title: "マイタイムテーブルとは？",
    content: <IntroContent />,
    selector: "#tour-dialog",
    side: "bottom",
    showControls: true,
    pointerPadding: 0,
    pointerRadius: 0,
    nextRoute: "/talks",
    prevRoute: "/talks/me",
  },
  // Step 1: /talks — セッションセル（追加ボタン付き）
  {
    icon: "1️⃣",
    title: "セッションを追加してみよう",
    content:
      "セッションの「参加予定」ボタンを押して、マイタイムテーブルに追加してみましょう。",
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
  // Step 5: /talks/me — セッションタイトルをクリックしてドロワーを開く
  {
    icon: "5️⃣",
    title: "セッション詳細を見てみよう",
    content: "追加したセッションのタイトルをタップすると、詳細を確認できます。",
    selector: "[data-tour-session-id]",
    side: "top",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 6: /talks/me — ドロワー内で参加記録を付ける
  {
    icon: "6️⃣",
    title: "参加記録を付けよう",
    content:
      "「参加記録を付ける」ボタンを押して、セッションへの参加を記録しましょう。",
    selector: "#tour-drawer-participate",
    side: "bottom",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 7: /talks/me — Remove talk（追加したセッションを削除）
  {
    icon: "7️⃣",
    title: "セッションを削除",
    content:
      "追加したセッションの右上の × をタップして削除してみましょう。検索パネルからも削除可能です。",
    selector: "[data-tour-session-id]",
    side: "top",
    showControls: true,
    pointerPadding: 4,
    pointerRadius: 8,
    nextRoute: "/talks/me",
    prevRoute: "/talks/me",
  },
  // Step 8: /talks/me — Share button
  {
    icon: "8️⃣",
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
  // Step 9: /talks/me — QR code button
  {
    icon: "9️⃣",
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
  // Step 10: /talks/me — Reset button
  {
    icon: "🔢",
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
  // Step 11: Final message (dialog mode — no highlight target)
  {
    icon: "🎉",
    title: "TSKaigi 2026を楽しもう！",
    content:
      "各セッションの詳細画面から参加記録を付けることができます。目指せ、行きたい全セッション踏破！",
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
