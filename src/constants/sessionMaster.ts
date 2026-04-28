import sessionMasterData from "./session-master.json";

type UseIcon = "x" | "github";

export type SessionMasterSpeaker = {
  name: string;
  profileImageUrl: string;
  bio: string;
  xId: string;
  githubId: string;
  qiitaLink: string;
  zennLink: string;
  noteLink: string;
  additionalLink: string;
  affiliation: string;
  position: string;
  userIcon: UseIcon;
};

export type SessionMasterEntry = {
  speakerId: string;
  title: string;
  overview: string;
  speaker: SessionMasterSpeaker;
  id?: string;
  ogpTitle?: string;
};

const sessionMaster = sessionMasterData as Record<string, SessionMasterEntry>;

export function getSessionMasterBySessionId(
  sessionId: string,
): SessionMasterEntry | undefined {
  return sessionMaster[sessionId];
}
