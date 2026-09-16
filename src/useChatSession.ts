import { useCallback, useEffect, useState } from 'react';
import type { ChatClient, ChatMessage, ChatSession } from './types';

const OFFLINE: ChatSession = { state: 'never', session_id: null, web_url: null, last_seen: null };

/** "2 min", "3 h", "2 days". */
export function since(iso: string | null | undefined): string {
  if (!iso) return 'a while';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(mins / 60);
  return hours < 48 ? `${hours} h` : `${Math.round(hours / 24)} days`;
}

/** The one line and the one button per state. */
export function describe(s: ChatSession, project: string): { line: string; action: string } {
  switch (s.state) {
    case 'open': return { line: `Live in cmux · ${project} workspace · last message ${since(s.last_seen)} ago`, action: 'Go to the tab' };
    case 'saved': return { line: `Tab closed ${since(s.last_seen)} ago · session kept`, action: 'Reopen the tab' };
    case 'closed': return { line: `No tab open · last session ${since(s.last_seen)} ago`, action: `Open a ${project} chat` };
    default: return { line: 'No session yet', action: `Open a ${project} chat` };
  }
}

/** The live session and its transcript, re-read every `pollMs`. Read-only. */
export function useChatSession(client: ChatClient | null, pollMs = 20_000) {
  const [session, setSession] = useState<ChatSession>(OFFLINE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reachable, setReachable] = useState<boolean | null>(null);

  const reload = useCallback(async () => {
    if (!client) { setReachable(false); return; }
    try {
      const [state, transcript] = await Promise.all([client.state(), client.transcript(40)]);
      setSession(state);
      setMessages(transcript.messages ?? []);
      setReachable(true);
    } catch {
      setSession(OFFLINE);
      setReachable(false); // the Mac is off or the door is not configured
    }
  }, [client]);

  useEffect(() => {
    void reload();
    const timer = setInterval(() => void reload(), pollMs);
    return () => clearInterval(timer);
  }, [reload, pollMs]);

  const open = useCallback(async () => {
    if (!client) return;
    setOpening(true);
    setError(null);
    try {
      setSession(await client.open());
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the chat');
    } finally {
      setOpening(false);
    }
  }, [client, reload]);

  return { session, messages, opening, error, reachable, open, reload };
}
