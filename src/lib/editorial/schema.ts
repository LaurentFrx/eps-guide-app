export type GuideSession = {
  id: string;
  title: string;
  theme: string;
  body?: string;
};

export type GuideData = {
  presentation: string;
  sessions: GuideSession[];
  conclusion: string;
  notes?: string;
  sources: string[];
};

export type EditorialSession = {
  title?: string;
  theme?: string;
  body?: string;
};

export type EditorialData = {
  presentation?: string | { text?: string };
  conclusion?: string | { text?: string };
  notes?: string | { text?: string };
  sources?: string[] | string | { text?: string };
  sessions?: EditorialSession[] | Record<string, EditorialSession>;
  guide?: {
    presentation?: string | { text?: string };
    conclusion?: string | { text?: string };
    notes?: string | { text?: string };
    sources?: string[] | string | { text?: string };
    sessions?: EditorialSession[] | Record<string, EditorialSession>;
  };
};
