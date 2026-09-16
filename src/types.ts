export type ChatState = 'open' | 'saved' | 'closed' | 'never';

export interface ChatSession {
  state: ChatState;
  session_id: string | null;
  web_url: string | null;
  last_seen: string | null;
  project?: string;
}

export interface ChatMessage {
  role: 'chris' | 'claude';
  ts: string;
  text: string;
}

/** How the dock talks to the Mac door. Each app supplies its own: the scraper
 *  calls chatdock.chrisshaw.me from the browser, Music goes through its bridge. */
export interface ChatClient {
  state(): Promise<ChatSession>;
  transcript(limit: number): Promise<{ messages: ChatMessage[] }>;
  open(): Promise<ChatSession>;
}

export interface DockTab {
  key: string;
  label: string;
  render: () => React.ReactNode;
}
