export type TrackKey = "LEVERAGES" | "UPSIDER" | "RIGHTTOUCH";

export type Track = {
  id: TrackKey;
  name: string;
  hashtag: string;
};

export type SessionRef = {
  id: string;
};

export type SessionSummary = {
  id: string;
  title: string;
  overview?: string;
  speaker: {
    name: string;
    profileImageUrl?: string;
    bio?: string;
    xId?: string;
    githubId?: string;
    additionalLink?: string;
    qiitaLink?: string;
    zennLink?: string;
    noteLink?: string;
    affiliation?: string;
    position?: string;
  };
};

export type ClosedTrack = {
  type: "closed";
};

export type OtherTrack = {
  type: "other";
  label: string;
  compact?: boolean;
};

export type OverrideTrack = {
  type: "override";
};

export type SessionKey = "KEYNOTE" | "LONG" | "SHORT" | "SPONSOR" | "HANDSON";

export type SessionTrack = {
  type: "session";
  sessionType: SessionKey;
  sessions: SessionRef[];
};

export type TrackContent =
  | ClosedTrack
  | OtherTrack
  | OverrideTrack
  | SessionTrack;

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

export type Slot = SharedSlot | IndividualSlot;

export type SpanGroup = {
  tracks: TrackKey[];
  label: string;
  startTime: number;
  endTime: number;
};

export type EventDate = "Day1" | "Day2";

export type TimetableResponse = {
  day: EventDate;
  date: string;
  tracks: Track[];
  slots: Slot[];
  spanGroups?: SpanGroup[];
};

export type TimetableListResponse = TimetableResponse[];
