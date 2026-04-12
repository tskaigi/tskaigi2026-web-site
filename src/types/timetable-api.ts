export type Track = {
  id: string;
  name: string;
  hashtag: string;
};

export type TrackKey = "LEVERAGES" | "UPSIDER" | "RIGHTTOUCH";

export type SessionSummary = {
  id: number;
  title: string;
  speaker: {
    name: string;
    profileImageUrl?: string;
  };
};

export type ClosedTrack = {
  type: "closed";
};

export type OtherTrack = {
  type: "other";
  label: string;
};

export type SessionTrack = {
  type: "session";
  sessionType: "KEYNOTE" | "LONG" | "SHORT" | "SPONSOR";
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

export type Slot = SharedSlot | IndividualSlot;

export type TimetableResponse = {
  day: 1 | 2;
  date: string;
  tracks: Track[];
  slots: Slot[];
};

export type TimetableListResponse = TimetableResponse[];
