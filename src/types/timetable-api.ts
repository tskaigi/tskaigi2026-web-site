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

export type SessionKey = "KEYNOTE" | "LONG" | "SHORT" | "SPONSOR" | "HANDSON";

export type SessionContent = {
  type: "session";
  sessionType: SessionKey;
  sessions: SessionRef[];
  // Render hint: when set, the cell is drawn as a labeled span (with optional
  // external link) instead of the per-session detail card. Used for cells that
  // logically belong to a session but visually represent a span (e.g. ハンズオン).
  displayLabel?: string;
  link?: string;
};

export type LabeledContent = {
  type: "labeled";
  label: string;
  link?: string;
  // Render as a muted gray simple row (e.g. 休憩 / ランチ / 一般開場).
  // When false / unset, render as a white card with TriangleBadge.
  muted?: boolean;
};

export type ClosedContent = {
  type: "closed";
};

export type CellContent = SessionContent | LabeledContent | ClosedContent;

export type Cell = {
  startTime: number;
  endTime: number;
  // Tracks the cell occupies. Must be contiguous in TRACK_KEYS order.
  // Length 1 = single track; length === TRACK_KEYS.length = full-width "shared" cell.
  tracks: TrackKey[];
  content: CellContent;
};

export type EventDate = "Day1" | "Day2";

export type TimetableResponse = {
  day: EventDate;
  date: string;
  tracks: Track[];
  cells: Cell[];
};

export type TimetableListResponse = TimetableResponse[];
