export type UseIcon = "x" | "github";

export type Speaker = {
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

export type SpeakerSource = {
  id: string;
  title: string;
  overview: string;
  slidesLink: string;
  speaker: Speaker;
};

export type MasterEntry = {
  speakerId: string;
  title: string;
  overview: string;
  speaker: Speaker;
  id?: string;
  ogpTitle?: string;
};
