export type Track = {
  id: string;
  name: string;
  hashtag: string;
};

export type TrackKey = "LEVERAGES" | "UPSIDER" | "RIGHTTOUCH";

export type SessionSummary = {
  id: string;
  title: string;
  overview?: string;
  speaker: {
    name: string;
    profileImageUrl?: string;
    bio?: string; // 自己紹介文
    xId?: string;
    githubId?: string;
    additionalLink?: string; // 追加リンク
    affiliation?: string; // 所属企業・団体
    position?: string; // ポジション・役職
  };
};

export type ClosedTrack = {
  type: "closed";
};

export type OtherTrack = {
  type: "other";
  label: string;
};

export type SessionKey = "KEYNOTE" | "LONG" | "SHORT" | "SPONSOR" | "HANDSON";

export type SessionTrack = {
  type: "session";
  sessionType: SessionKey;
  sessions: SessionSummary[];
};

export type TrackContent = ClosedTrack | OtherTrack | SessionTrack;

export type SharedSlot = {
  slotType: "shared";
  startTime: number; // timestamp
  endTime: number; // timestamp
  label: string;
};

export type IndividualSlot = {
  slotType: "individual";
  startTime: number; // timestamp
  endTime: number; // timestamp
  tracks: Record<TrackKey, TrackContent>;
};

type Slot = SharedSlot | IndividualSlot;

export type EventDate = "Day1" | "Day2";

export type TimetableResponse = {
  day: EventDate;
  date: string;
  tracks: Track[];
  slots: Slot[];
};

export type TimetableListResponse = TimetableResponse[];
