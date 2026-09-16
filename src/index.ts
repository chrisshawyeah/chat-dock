export { ChatDock, ChatTranscript } from './ChatDock';
export type { ChatDockProps } from './ChatDock';
export { useChatSession, describe, since } from './useChatSession';
export type { ChatClient, ChatMessage, ChatSession, ChatState, DockTab } from './types';

/** A client for the Mac door (yue_server.py behind chatdock.chrisshaw.me), called from the browser. */
export function doorClient(baseUrl: string, token: string, project: string) {
  const base = baseUrl.replace(/\/+$/, '');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const get = async (path: string) => {
    const r = await fetch(`${base}${path}`, { headers });
    if (!r.ok) throw new Error(`door ${r.status}`);
    return r.json();
  };
  return {
    state: () => get(`/chat/state?project=${encodeURIComponent(project)}`),
    transcript: (limit: number) => get(`/chat/transcript?project=${encodeURIComponent(project)}&limit=${limit}`),
    open: async () => {
      const r = await fetch(`${base}/chat/open`, { method: 'POST', headers, body: JSON.stringify({ project }) });
      if (!r.ok) throw new Error(`door ${r.status}`);
      return r.json();
    },
  };
}
